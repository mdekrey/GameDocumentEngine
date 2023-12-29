using GameDocumentEngine.Server;
using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Tracing;
using GameDocumentEngine.Server.Users;
using Google.Protobuf.WellKnownTypes;
using Json.Patch;
using Json.Schema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Internal;
using static GameDocumentEngine.Server.Documents.GameSecurity;

namespace GameDocumentEngine.Server.Documents;

public class GameController : Api.GameControllerBase
{
	private readonly GameTypes gameTypes;
	private readonly DocumentDbContext dbContext;
	private readonly IPermissionedApiMapper<GameModel, GameDetails> gameMapper;
	private readonly IApiMapper<IGameType, GameTypeDetails> gameTypeMapper;
	private readonly GamePermissionSetResolver permissionSetResolver;

	public GameController(
		GameTypes gameTypes,
		Data.DocumentDbContext dbContext,
		IPermissionedApiMapper<GameModel, Api.GameDetails> gameMapper,
		IApiMapper<IGameType, Api.GameTypeDetails> gameTypeMapper,
		GamePermissionSetResolver permissionSetResolver)
	{
		this.gameTypes = gameTypes;
		this.dbContext = dbContext;
		this.gameMapper = gameMapper;
		this.gameTypeMapper = gameTypeMapper;
		this.permissionSetResolver = permissionSetResolver;
	}

	protected override async Task<CreateGameActionResult> CreateGame(CreateGameDetails createGameBody)
	{
		if (!ModelState.IsValid || !gameTypes.All.TryGetValue(createGameBody.Type, out var gameType))
			return CreateGameActionResult.BadRequest();

		var user = await dbContext.GetCurrentUserOrThrow(User);
		var gameUser = new GameUserModel { User = user, Role = gameType.DefaultNewGameRole };
		var game = new GameModel
		{
			Name = createGameBody.Name,
			Type = createGameBody.Type,
			Players = { gameUser },
		};
		dbContext.Add(game);
		await dbContext.SaveChangesAsync();
		var permissions = gameType.ToPermissionSet(gameUser);
		return CreateGameActionResult.Ok(await gameMapper.ToApi(dbContext, game, permissions, DbContextChangeUsage.AfterChange));
	}

	protected override async Task<ListGamesActionResult> ListGames()
	{
		var games = await (from gameUser in dbContext.GameUsers
						   where gameUser.UserId == User.GetCurrentUserId()
						   select gameUser.Game).ToArrayAsync();
		return ListGamesActionResult.Ok(games.ToDictionary(g => g.Id.ToString(), g => new GameSummary((Identifier)g.Id, g.Name)));
	}

	protected override async Task<DeleteGameActionResult> DeleteGame(Identifier gameId)
	{
		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId.Value);
		if (permissions == null) return DeleteGameActionResult.NotFound();
		if (!permissions.HasPermission(GameSecurity.DeleteGame(gameId.Value))) return DeleteGameActionResult.Forbidden();
		var game = await dbContext.Games.Include(g => g.Players).FirstAsync(g => g.Id == gameId.Value);

		dbContext.RemoveRange(game.Players);
		dbContext.Remove(game);
		await dbContext.SaveChangesAsync();
		return DeleteGameActionResult.Ok();
	}

	protected override async Task<GetGameDetailsActionResult> GetGameDetails(Identifier gameId)
	{
		if (!ModelState.IsValid) return GetGameDetailsActionResult.NotFound();
		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId.Value);
		if (permissions == null) return GetGameDetailsActionResult.NotFound();
		if (!permissions.HasPermission(ViewGame(gameId.Value))) return GetGameDetailsActionResult.Forbidden();

		var gameRecord = permissions.GameUser.Game
			?? await dbContext.Games.FirstAsync(g => g.Id == gameId.Value);
		return GetGameDetailsActionResult.Ok(await gameMapper.ToApi(dbContext, gameRecord, permissions, DbContextChangeUsage.AfterChange));
	}

	protected override async Task<PatchGameActionResult> PatchGame(Identifier gameId, JsonPatch patchGameBody)
	{
		if (!ModelState.IsValid) return PatchGameActionResult.BadRequest("Unable to parse JSON Patch");

		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId.Value);
		if (permissions == null) return PatchGameActionResult.NotFound();
		if (!permissions.HasPermission(UpdateGame(gameId.Value))) return PatchGameActionResult.Forbidden();

		var gameRecord = permissions.GameUser.Game
			?? await dbContext.Games.FirstAsync(g => g.Id == gameId.Value);
		using (TracingHelper.StartActivity("Apply Patch"))
			if (!patchGameBody.ApplyModelPatch(gameRecord, EditableGameModel.Create, dbContext, out var error))
				return error is PatchTestError
					? PatchGameActionResult.Conflict()
					: PatchGameActionResult.BadRequest(error.Message ?? "Unknown error");

		using (TracingHelper.StartActivity("Save changes"))
			await dbContext.SaveChangesAsync();

		return PatchGameActionResult.Ok(await gameMapper.ToApi(dbContext, gameRecord, permissions, DbContextChangeUsage.AfterChange));
	}

	protected override async Task<GetGameTypeActionResult> GetGameType(string gameType)
	{
		return gameTypes.All.TryGetValue(gameType, out var r)
			? GetGameTypeActionResult.Ok(await gameTypeMapper.ToApi(dbContext, r))
			: GetGameTypeActionResult.NotFound();
	}

	protected override async Task<RemovePlayerFromGameActionResult> RemovePlayerFromGame(Identifier gameId, Identifier playerId)
	{
		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId.Value);
		if (permissions == null) return RemovePlayerFromGameActionResult.NotFound();
		if (!permissions.HasPermission(UpdateGameUserAccess(gameId.Value))) return RemovePlayerFromGameActionResult.Forbidden();

		if (playerId.Value == permissions.GameUser.PlayerId) return RemovePlayerFromGameActionResult.Forbidden();
		var gameUserRecord = await (from gameUser in dbContext.GameUsers
									where gameUser.PlayerId == playerId.Value && gameUser.GameId == gameId.Value
									select gameUser)
			.SingleOrDefaultAsync();
		if (gameUserRecord == null) return RemovePlayerFromGameActionResult.NotFound();

		dbContext.Remove(gameUserRecord);
		await dbContext.SaveChangesAsync();
		return RemovePlayerFromGameActionResult.NoContent();
	}

	protected override async Task<UpdateGameRoleAssignmentsActionResult> UpdateGameRoleAssignments(Identifier gameId, Dictionary<string, string> updateGameRoleAssignmentsBody)
	{
		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId.Value);
		if (permissions == null) return UpdateGameRoleAssignmentsActionResult.NotFound();
		if (!permissions.HasPermission(UpdateGameUserAccess(gameId.Value))) return UpdateGameRoleAssignmentsActionResult.Forbidden();
		if (!gameTypes.All.TryGetValue(permissions.GameUser.Game.Type, out var gameType))
			throw new InvalidOperationException($"Unknown game type: {permissions.GameUser.Game.Type}");

		var gameUserRecords = await (from gameUser in dbContext.GameUsers
									 where gameUser.GameId == gameId.Value
									 select gameUser).ToArrayAsync();
		foreach (var kvp in updateGameRoleAssignmentsBody)
		{
			var key = Identifier.FromString(kvp.Key).Value;
			if (key == permissions.GameUser.PlayerId)
				// Can't update your own permissions!
				return UpdateGameRoleAssignmentsActionResult.Forbidden();
			if (gameUserRecords.FirstOrDefault(u => u.PlayerId == key) is not GameUserModel modifiedUser)
				return UpdateGameRoleAssignmentsActionResult.BadRequest();
			if (!gameType.Roles.Contains(kvp.Value))
				return UpdateGameRoleAssignmentsActionResult.BadRequest();

			modifiedUser.Role = kvp.Value;
		}
		await dbContext.SaveChangesAsync();
		return UpdateGameRoleAssignmentsActionResult.Ok(
			gameUserRecords.ToDictionary(gu => Identifier.ToString(gu.PlayerId), gu => gu.Role)
		);
	}
}

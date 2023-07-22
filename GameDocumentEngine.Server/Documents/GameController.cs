﻿using GameDocumentEngine.Server;
using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Realtime;
using GameDocumentEngine.Server.Security;
using GameDocumentEngine.Server.Users;
using Json.Patch;
using Json.Schema;
using Microsoft.AspNetCore.SignalR;
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

	protected async Task<bool?> HasPermission(Guid gameId, string permission)
	{
		return await permissionSetResolver.HasPermission(User, gameId, permission);
	}

	protected override async Task<CreateGameActionResult> CreateGame(CreateGameDetails createGameBody)
	{
		if (!ModelState.IsValid || !gameTypes.All.TryGetValue(createGameBody.Type, out _))
			return CreateGameActionResult.BadRequest();

		var user = await dbContext.GetCurrentUserOrThrow(User);
		var gameUser = new GameUserModel { User = user, Role = DefaultGameRole };
		var game = new GameModel
		{
			Name = createGameBody.Name,
			Type = createGameBody.Type,
			Players = { gameUser },
		};
		dbContext.Add(game);
		await dbContext.SaveChangesAsync();
		var permissions = gameUser.ToPermissionSet();
		return CreateGameActionResult.Ok(await gameMapper.ToApi(dbContext, game, permissions));
	}

	protected override async Task<ListGamesActionResult> ListGames()
	{
		var games = await (from gameUser in dbContext.GameUsers
						   where gameUser.UserId == User.GetCurrentUserId()
						   select gameUser.Game).ToArrayAsync();
		return ListGamesActionResult.Ok(games.ToDictionary(g => g.Id.ToString(), g => new GameSummary(g.Id, g.Name)));
	}

	protected override async Task<DeleteGameActionResult> DeleteGame(Guid gameId)
	{
		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId);
		if (permissions == null) return DeleteGameActionResult.NotFound();
		if (!permissions.HasPermission(GameSecurity.DeleteGame(gameId))) return DeleteGameActionResult.Forbidden();
		var game = await dbContext.Games.Include(g => g.Players).FirstAsync(g => g.Id == gameId);

		dbContext.RemoveRange(game.Players);
		dbContext.Remove(game);
		await dbContext.SaveChangesAsync();
		return DeleteGameActionResult.Ok();
	}

	protected override async Task<GetGameDetailsActionResult> GetGameDetails(Guid gameId)
	{
		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId);
		if (permissions == null) return GetGameDetailsActionResult.NotFound();
		if (!permissions.HasPermission(ViewGame(gameId))) return GetGameDetailsActionResult.Forbidden();

		var gameRecord = await dbContext.Games.FirstAsync(g => g.Id == gameId);
		return GetGameDetailsActionResult.Ok(await gameMapper.ToApi(dbContext, gameRecord, permissions));
	}

	protected override async Task<PatchGameActionResult> PatchGame(Guid gameId, JsonPatch patchGameBody)
	{
		if (!ModelState.IsValid) return PatchGameActionResult.BadRequest("Unable to parse JSON Patch");

		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId);
		if (permissions == null) return PatchGameActionResult.NotFound();
		if (!permissions.HasPermission(UpdateGame(gameId))) return PatchGameActionResult.Forbidden();

		var gameRecord = await dbContext.Games.FirstAsync(g => g.Id == gameId);
		if (!patchGameBody.ApplyModelPatch(gameRecord, EditableGameModel.Create, dbContext, out var error))
			return PatchGameActionResult.BadRequest(error.Message ?? "Unknown error");

		await dbContext.SaveChangesAsync();

		return PatchGameActionResult.Ok(await gameMapper.ToApi(dbContext, gameRecord, permissions));
	}

	protected override async Task<GetGameTypeActionResult> GetGameType(string gameType)
	{
		return gameTypes.All.TryGetValue(gameType, out var r)
			? GetGameTypeActionResult.Ok(await gameTypeMapper.ToApi(dbContext, r))
			: GetGameTypeActionResult.NotFound();
	}

	protected override async Task<RemoveUserFromGameActionResult> RemoveUserFromGame(Guid gameId, Guid userId)
	{
		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId);
		if (permissions == null) return RemoveUserFromGameActionResult.NotFound();
		if (!permissions.HasPermission(UpdateGameUserAccess(gameId))) return RemoveUserFromGameActionResult.Forbidden();

		if (userId == User.GetUserIdOrThrow()) return RemoveUserFromGameActionResult.Forbidden();
		var gameUserRecord = await (from gameUser in dbContext.GameUsers.Include(gu => gu.Game)
									where gameUser.UserId == userId && gameUser.GameId == gameId
									select gameUser)
			.SingleOrDefaultAsync();
		if (gameUserRecord == null) return RemoveUserFromGameActionResult.NotFound();

		dbContext.Remove(gameUserRecord);
		await dbContext.SaveChangesAsync();
		return RemoveUserFromGameActionResult.NoContent();
	}
}

class GameModelApiMapper : IPermissionedApiMapper<GameModel, Api.GameDetails>
{
	private readonly GameTypes gameTypes;
	private readonly IApiMapper<IGameType, GameTypeDetails> gameTypeMapper;

	public GameModelApiMapper(GameTypes gameTypes, IApiMapper<IGameType, Api.GameTypeDetails> gameTypeMapper)
	{
		this.gameTypes = gameTypes;
		this.gameTypeMapper = gameTypeMapper;
	}

	public Task<GameDetails> ToApi(DocumentDbContext dbContext, GameModel game, PermissionSet permissionSet) =>
		ToApi(dbContext, game, DbContextChangeUsage.AfterChange);

	public Task<GameDetails> ToApiBeforeChanges(DocumentDbContext dbContext, GameModel entity, PermissionSet permissionSet) =>
		ToApi(dbContext, entity, DbContextChangeUsage.BeforeChange);

	private async Task<GameDetails> ToApi(DocumentDbContext dbContext, GameModel entity, DbContextChangeUsage usage)
	{
		var resultGame = dbContext.Entry(entity).AtState(usage);

		var gameUsers = dbContext
			.Entry(entity)
			.Collection(game => game.Players);
		// TODO: Consider not including user info in the Game. This causes us to load
		// a query instead of the collection. Also, we can't use these results because
		// it only includes active results.
		// Doing this does work some of the time; it helps with the LoadWithFixupAsync runs.
		await gameUsers.Query().Include(gu => gu.User).LoadAsync();
		var userEntries = gameUsers
			.Entries(dbContext)
			.AtStateEntries(usage)
			.Select(e => e.Reference(gu => gu.User));

		// TODO: https://github.com/mdekrey/GameDocumentEngine/issues/1
		// I believe this was caused by an issue in EF Core. If an entity is
		// marked as "Deleted" but later has a query that loads a reference, that
		// referenced entity is added to the change tracker but not linked on the property.
		await userEntries.WhenAll(nav => nav.LoadWithFixupAsync());

		var users = userEntries
			.Select(e => e.TargetEntry ?? throw new InvalidOperationException("LoadWithFixup failed"))
			.AtState(usage)
			.ToArray();

		var typeInfo = gameTypes.All.TryGetValue(resultGame.Type, out var gameType)
			? await gameTypeMapper.ToApi(dbContext, gameType)
			: throw new NotSupportedException("Unknown game type");

		return ToApi(resultGame, users, typeInfo);
	}

	private static GameDetails ToApi(GameModel game, UserModel[] users, GameTypeDetails typeInfo)
	{
		return new GameDetails(Name: game.Name,
					LastUpdated: game.LastModifiedDate,
					Players: users.ToDictionary(p => p.Id.ToString(), p => p.Name),
					Id: game.Id,
					TypeInfo: typeInfo
				);
	}

	public object ToKey(GameModel entity) => entity.Id;

}

class GameTypeApiMapper : IApiMapper<IGameType, Api.GameTypeDetails>
{
	private readonly GameTypes gameTypes;

	public GameTypeApiMapper(GameTypes gameTypes)
	{
		this.gameTypes = gameTypes;
	}

	public async Task<GameTypeDetails> ToApi(DocumentDbContext dbContext, IGameType gameType)
	{
		return new GameTypeDetails(
			Name: gameType.Name,
			UserRoles: GameRoles,
			ObjectTypes: await Task.WhenAll(
				gameType.ObjectTypes.Select(async obj => new GameObjectTypeDetails(
				Name: obj.Name,
					Scripts: (await Task.WhenAll(gameType.ObjectTypes.Select(gameTypes.ResolveGameObjectScripts))).SelectMany(a => a).Distinct(),
					// Game types could have different roles eventually; for now, we use a hard-coded set
					UserRoles: obj.PermissionLevels
				)))
		);
	}

	public Task<GameTypeDetails> ToApiBeforeChanges(DocumentDbContext dbContext, IGameType gameType) =>
		ToApi(dbContext, gameType);

	public object ToKey(IGameType entity) => entity.Name;
}

class GameModelChangeNotifications : PermissionedEntityChangeNotifications<GameModel, GameUserModel, Api.GameDetails>
{
	public GameModelChangeNotifications(
		IPermissionedApiMapper<GameModel, GameDetails> apiMapper,
		IApiChangeNotification<GameDetails> changeNotification)
		: base(apiMapper, changeNotification, du => du.UserId, du => du.Game)
	{
	}

	protected override async Task<IEnumerable<PermissionSet>> GetUsersFor(DocumentDbContext context, GameModel entity, DbContextChangeUsage changeState)
	{
		var players = context.Entry(entity).Collection(d => d.Players);
		await players.LoadAsync();

		var gameUsers = await context.LoadEntityEntriesAsync<GameUserModel>(g => g.GameId == entity.Id);

		return gameUsers.AtState(changeState)
			.Select(GameSecurity.ToPermissionSet);
	}
}

class GameApiChangeNotification : IApiChangeNotification<Api.GameDetails>
{
	private readonly IHubContext<GameDocumentsHub> hubContext;

	public GameApiChangeNotification(IHubContext<GameDocumentsHub> hubContext)
	{
		this.hubContext = hubContext;
	}

	public async Task SendAddedNotification(object apiKey, GameDetails newApiObject, Guid userId) =>
		await hubContext.User(userId).SendValue("Game", apiKey, newApiObject);

	public async Task SendDeletedNotification(object apiKey, Guid userId) =>
		await hubContext.User(userId).SendDeleted("Game", apiKey);

	public async Task SendModifiedNotification(object apiKey, GameDetails oldApiObject, GameDetails newApiObject, Guid userId)
	{
		await hubContext.User(userId).SendWithPatch("Game", apiKey, oldApiObject, newApiObject);
	}
}
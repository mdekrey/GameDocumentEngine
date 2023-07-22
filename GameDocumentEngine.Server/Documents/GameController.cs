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
using System.Reflection;
using System.Security.AccessControl;
using System.Security.Claims;
using System.Text.Json.Nodes;

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
		var permissionSet = await permissionSetResolver.GetPermissions(User.GetUserIdOrThrow(), gameId);
		return permissionSet?.Permissions.HasPermission(permission);
	}

	protected override async Task<CreateGameActionResult> CreateGame(CreateGameDetails createGameBody)
	{
		if (!ModelState.IsValid || !gameTypes.All.TryGetValue(createGameBody.Type, out _))
			return CreateGameActionResult.BadRequest();

		var user = await dbContext.GetCurrentUserOrThrow(User);
		var game = new GameModel
		{
			Name = createGameBody.Name,
			Type = createGameBody.Type,
			Players = { new GameUserModel { User = user, Role = GameSecurity.DefaultGameRole } },
		};
		dbContext.Add(game);
		await dbContext.SaveChangesAsync();
		return CreateGameActionResult.Ok(await gameMapper.ToApi(dbContext, game, PermissionSet.Stub));
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
		switch (await HasPermission(gameId, GameSecurity.DeleteGame(gameId)))
		{
			case null: return DeleteGameActionResult.NotFound();
			case false: return DeleteGameActionResult.Forbidden();
		}
		var game = await dbContext.Games.Include(g => g.Players).FirstAsync(g => g.Id == gameId);

		dbContext.RemoveRange(game.Players);
		dbContext.Remove(game);
		await dbContext.SaveChangesAsync();
		return DeleteGameActionResult.Ok();
	}

	protected override async Task<GetGameDetailsActionResult> GetGameDetails(Guid gameId)
	{
		switch (await HasPermission(gameId, GameSecurity.ViewGame(gameId)))
		{
			case null: return GetGameDetailsActionResult.NotFound();
			case false: return GetGameDetailsActionResult.Forbidden();
		}
		var gameRecord = await dbContext.Games.FirstAsync(g => g.Id == gameId);
		return GetGameDetailsActionResult.Ok(await gameMapper.ToApi(dbContext, gameRecord, PermissionSet.Stub));
	}

	protected override async Task<PatchGameActionResult> PatchGame(Guid gameId, JsonPatch patchGameBody)
	{
		if (!ModelState.IsValid) return PatchGameActionResult.BadRequest("Unable to parse JSON Patch");

		switch (await HasPermission(gameId, GameSecurity.UpdateGame(gameId)))
		{
			case null: return PatchGameActionResult.NotFound();
			case false: return PatchGameActionResult.Forbidden();
		}

		var gameRecord = await dbContext.Games.FirstAsync(g => g.Id == gameId);

		// TODO: I can do better at patches for this
		var editable = new JsonObject(
			new[]
			{
				KeyValuePair.Create<string, JsonNode?>("name", gameRecord.Name),
			}
		);
		var result = patchGameBody.Apply(editable);
		if (!result.IsSuccess)
			return PatchGameActionResult.BadRequest(result.Error ?? "Unknown error");
		gameRecord.Name = result.Result?["name"]?.GetValue<string?>() ?? gameRecord.Name;
		await dbContext.SaveChangesAsync();

		return PatchGameActionResult.Ok(await gameMapper.ToApi(dbContext, gameRecord, PermissionSet.Stub));
	}

	protected override async Task<GetGameTypeActionResult> GetGameType(string gameType)
	{
		return gameTypes.All.TryGetValue(gameType, out var r)
			? GetGameTypeActionResult.Ok(await gameTypeMapper.ToApi(dbContext, r))
			: GetGameTypeActionResult.NotFound();
	}

	protected override async Task<RemoveUserFromGameActionResult> RemoveUserFromGame(Guid gameId, Guid userId)
	{
		switch (await HasPermission(gameId, GameSecurity.UpdateGameUserAccess(gameId)))
		{
			case null: return RemoveUserFromGameActionResult.NotFound();
			case false: return RemoveUserFromGameActionResult.Forbidden();
		}

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

	// TODO: Consider not including user info in the Game, which is what causes this complexity
	public async Task<GameDetails> ToApi(DocumentDbContext dbContext, GameModel game, PermissionSet permissionSet)
	{
		var userIds = (await dbContext.LoadEntityEntriesAsync<GameUserModel>(gu => gu.GameId == game.Id))
			.AtStateEntries(DbContextChangeUsage.AfterChange)
			.Select(e => e.Entity.UserId)
			.ToArray();
		var users = await dbContext.Users.Where(u => userIds.Contains(u.Id)).ToArrayAsync();

		var typeInfo = gameTypes.All.TryGetValue(game.Type, out var gameType)
			? await gameTypeMapper.ToApi(dbContext, gameType)
			: throw new NotSupportedException("Unknown game type");

		return ToApi(game, users, typeInfo);
	}

	public async Task<GameDetails> ToApiBeforeChanges(DocumentDbContext dbContext, GameModel entity, PermissionSet permissionSet)
	{
		// TODO: There has to be a better way for this... and I think it's probably wrong
		var gameEntry = dbContext.Entry(entity);
		var originalGame = OriginalModel(gameEntry);
		var gameUserModelEntries = await dbContext.LoadEntityEntriesAsync<GameUserModel>(gu => gu.GameId == originalGame.Id);
		var userIds = gameUserModelEntries
			.AtStateEntries(DbContextChangeUsage.BeforeChange)
			.Select(e => e.Entity.UserId)
			.ToArray();
		var newUsers = await dbContext.Users.Where(u => userIds.Contains(u.Id)).ToArrayAsync();
		var users = newUsers.Select(userModel => LoadOriginalUserModel(dbContext, userModel)).ToArray();

		var typeInfo = gameTypes.All.TryGetValue(originalGame.Type, out var gameType)
			? await gameTypeMapper.ToApi(dbContext, gameType)
			: throw new NotSupportedException("Unknown game type");

		return ToApi(originalGame, users, typeInfo);
	}

	private async Task<UserModel> LoadCurrentUserModel(DocumentDbContext dbContext, GameUserModel gameUser)
	{
		return await dbContext.Users.FindAsync(gameUser.UserId)
			?? throw new InvalidOperationException("Could not find the user by id");
	}

	private UserModel LoadOriginalUserModel(DocumentDbContext dbContext, UserModel userModel)
	{
		return OriginalModel(dbContext.Entry(userModel));
	}

	private T OriginalModel<T>(EntityEntry<T> entityEntry)
		where T : class
	{
		return entityEntry.OriginalValues.Clone().ToObject() as T
			?? throw new InvalidOperationException("Could not create original");
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
			UserRoles: GameSecurity.GameRoles,
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
			.Select(gameUser => new PermissionSet(gameUser.UserId, gameUser.ToPermissions()));
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
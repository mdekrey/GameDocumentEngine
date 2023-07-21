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

	public GameController(
		GameTypes gameTypes,
		Data.DocumentDbContext dbContext,
		IPermissionedApiMapper<GameModel, Api.GameDetails> gameMapper,
		IApiMapper<IGameType, Api.GameTypeDetails> gameTypeMapper)
	{
		this.gameTypes = gameTypes;
		this.dbContext = dbContext;
		this.gameMapper = gameMapper;
		this.gameTypeMapper = gameTypeMapper;
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
		var gameUserRecord = await (from gameUser in dbContext.GameUsers.Include(du => du.Game).ThenInclude(d => d.Players)
									where gameUser.GameId == gameId && gameUser.UserId == User.GetCurrentUserId()
									select gameUser).SingleOrDefaultAsync();
		if (gameUserRecord == null) return DeleteGameActionResult.NotFound();
		if (!gameUserRecord.ToPermissions().HasPermission(GameSecurity.DeleteGame(gameId)))
			return DeleteGameActionResult.Forbidden();

		dbContext.RemoveRange(gameUserRecord.Game.Players);
		dbContext.Remove(gameUserRecord.Game);
		await dbContext.SaveChangesAsync();
		return DeleteGameActionResult.Ok();
	}

	protected override async Task<GetGameDetailsActionResult> GetGameDetails(Guid gameId)
	{
		var gameRecord = await (from gameUser in dbContext.GameUsers.Include(gu => gu.Game).ThenInclude(g => g.Players).ThenInclude(gu => gu.User)
								where gameUser.GameId == gameId && gameUser.UserId == User.GetCurrentUserId()
								select gameUser.Game)
			.SingleOrDefaultAsync();
		if (gameRecord == null) return GetGameDetailsActionResult.NotFound();

		return GetGameDetailsActionResult.Ok(await gameMapper.ToApi(dbContext, gameRecord, PermissionSet.Stub));
	}

	protected override async Task<PatchGameActionResult> PatchGame(Guid gameId, JsonPatch patchGameBody)
	{
		if (!ModelState.IsValid) return PatchGameActionResult.BadRequest("Unable to parse JSON Patch");

		var gameUserRecord = await (from gameUser in dbContext.GameUsers.Include(gu => gu.Game).ThenInclude(g => g.Players).ThenInclude(gu => gu.User)
									where gameUser.UserId == User.GetCurrentUserId() && gameUser.GameId == gameId
									select gameUser)
			.SingleOrDefaultAsync();
		if (gameUserRecord == null) return PatchGameActionResult.NotFound();
		if (!gameUserRecord.ToPermissions().HasPermission(GameSecurity.UpdateGame(gameId)))
			return PatchGameActionResult.Forbidden();
		// TODO: change permissions, with permissions

		var editable = new JsonObject(
			new[]
			{
				KeyValuePair.Create<string, JsonNode?>("name", gameUserRecord.Game.Name),
			}
		);
		var result = patchGameBody.Apply(editable);
		if (!result.IsSuccess)
			return PatchGameActionResult.BadRequest(result.Error ?? "Unknown error");
		gameUserRecord.Game.Name = result.Result?["name"]?.GetValue<string?>() ?? gameUserRecord.Game.Name;
		await dbContext.SaveChangesAsync();

		return PatchGameActionResult.Ok(await gameMapper.ToApi(dbContext, gameUserRecord.Game, PermissionSet.Stub));
	}

	protected override async Task<GetGameTypeActionResult> GetGameType(string gameType)
	{
		return gameTypes.All.TryGetValue(gameType, out var r)
			? GetGameTypeActionResult.Ok(await gameTypeMapper.ToApi(dbContext, r))
			: GetGameTypeActionResult.NotFound();
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
		var users = await Task.WhenAll((await dbContext.LoadEntityEntriesAsync<GameUserModel>(gu => gu.GameId == game.Id))
			.AtStateEntries(DbContextChangeUsage.AfterChange)
			.Select(e => LoadCurrentUserModel(dbContext, e.Entity)));

		var typeInfo = gameTypes.All.TryGetValue(game.Type, out var gameType)
			? await gameTypeMapper.ToApi(dbContext, gameType)
			: throw new NotSupportedException("Unknown game type");

		return ToApi(game, users, typeInfo);
	}

	public async Task<GameDetails> ToApiBeforeChanges(DocumentDbContext dbContext, GameModel entity, PermissionSet permissionSet)
	{
		var gameEntry = dbContext.Entry(entity);
		var originalGame = OriginalModel(gameEntry);
		var users = await Task.WhenAll((await dbContext.LoadEntityEntriesAsync<GameUserModel>(gu => gu.GameId == originalGame.Id))
			.AtStateEntries(DbContextChangeUsage.BeforeChange)
			.Select(e => LoadOriginalUserModel(dbContext, e.Entity)));

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

	private async Task<UserModel> LoadOriginalUserModel(DocumentDbContext dbContext, GameUserModel gameUser)
	{
		var user = await LoadCurrentUserModel(dbContext, gameUser);
		return OriginalModel(dbContext.Entry(user));
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

	public async ValueTask SendAddedNotification(object apiKey, GameDetails newApiObject, Guid userId) =>
		await hubContext.User(userId).SendValue("Game", apiKey, newApiObject);

	public async ValueTask SendDeletedNotification(object apiKey, Guid userId) =>
		await hubContext.User(userId).SendDeleted("Game", apiKey);

	public async ValueTask SendModifiedNotification(object apiKey, GameDetails oldApiObject, GameDetails newApiObject, Guid userId)
	{
		await hubContext.User(userId).SendWithPatch("Game", apiKey, oldApiObject, newApiObject);
	}
}
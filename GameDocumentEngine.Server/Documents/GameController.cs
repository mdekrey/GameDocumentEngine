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
using System.Security.Claims;
using System.Text.Json.Nodes;

namespace GameDocumentEngine.Server.Documents;

public class GameController : Api.GameControllerBase
{
	private readonly GameTypes gameTypes;
	private readonly DocumentDbContext dbContext;

	public GameController(GameTypes gameTypes, Data.DocumentDbContext dbContext)
	{
		this.gameTypes = gameTypes;
		this.dbContext = dbContext;
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
		return CreateGameActionResult.Ok(await GameModelChangeNotification.ToGameDetails(dbContext, game, gameTypes));
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

		return GetGameDetailsActionResult.Ok(await GameModelChangeNotification.ToGameDetails(dbContext, gameRecord, gameTypes));
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

		return PatchGameActionResult.Ok(await GameModelChangeNotification.ToGameDetails(dbContext, gameUserRecord.Game, gameTypes));
	}

	protected override async Task<GetGameTypeActionResult> GetGameType(string gameType)
	{
		return gameTypes.All.TryGetValue(gameType, out var r)
			? GetGameTypeActionResult.Ok(await GameModelChangeNotification.ToGameTypeDetails(r, gameTypes))
			: GetGameTypeActionResult.NotFound();
	}
}

class GameModelChangeNotification : EntityChangeNotifications<GameModel, Api.GameDetails>
{
	private readonly GameTypes gameTypes;

	public GameModelChangeNotification(GameTypes gameTypes)
	{
		this.gameTypes = gameTypes;
	}

	public override bool CanHandle(EntityEntry changedEntity) => changedEntity.Entity is GameModel or GameUserModel;

	public override ValueTask SendNotification(DocumentDbContext context, IHubClients clients, EntityEntry changedEntity)
	{
		if (changedEntity.Entity is GameUserModel)
			return SendNotificationUserModel(context, clients, changedEntity);
		return base.SendNotification(context, clients, changedEntity);
	}

	private async ValueTask SendNotificationUserModel(DocumentDbContext context, IHubClients clients, EntityEntry changedEntity)
	{
		var target = changedEntity.Entity as GameUserModel;
		if (target == null)
			return;
		var players = await context.GameUsers.Where(du => du.GameId == target.GameId).Where(u => u.UserId != target.UserId).Select(target => target.UserId).ToArrayAsync();

		// treat removing the `target` as deleting the game, adding the 'target' as creating the game, and broadcast changes to others on the game
		var currentUser = GroupNames.UserDirect(target.UserId);
		var otherUsers = players.Select(GroupNames.UserDirect);
		var key = target.GameId;
		if (changedEntity.State == EntityState.Deleted)
			await clients.Group(currentUser).SendAsync("GameDeleted", new { key });
		else if (changedEntity.State == EntityState.Added)
			await clients.Group(currentUser).SendAsync("GameAdded", new { key, value = await GetValue() });
		else if (changedEntity.State == EntityState.Modified)
			await clients.Group(currentUser).SendAsync("GameChanged", new { key, value = await GetValue() });

		await clients.Groups(otherUsers).SendAsync("GameUsersChanged", new { key });

		async Task<Api.GameDetails> GetValue() =>
			await ToApi(context,
				target.Game
				?? await context.Games.FindAsync(key)
				?? throw new InvalidOperationException("Could not find doc")
			);
	}

	protected override bool HasAddedMessage => false;
	protected override Task SendAddedMessage(Data.DocumentDbContext context, IHubClients clients, GameModel result, object message) =>
		Task.CompletedTask;

	protected override Task SendDeletedMessage(Data.DocumentDbContext context, IHubClients clients, GameModel original, object message) =>
		Task.CompletedTask;

	protected override async Task SendModifiedMessage(Data.DocumentDbContext context, IHubClients clients, GameModel original, object message)
	{
		var players = await context.GameUsers.Where(du => du.GameId == original.Id).Select(target => target.UserId).ToArrayAsync();
		await clients.Groups(players.Select(GroupNames.UserDirect)).SendAsync("GameChanged", message);
	}

	protected override Task<GameDetails> ToApi(Data.DocumentDbContext context, GameModel game) =>
		ToGameDetails(context, game, gameTypes);

	public static async Task<GameDetails> ToGameDetails(Data.DocumentDbContext context, GameModel game, GameTypes gameTypes)
	{
		var users = await context.Entry(game).Collection(g => g.Players).Query().Select(gu => gu.User).ToArrayAsync();

		return new GameDetails(Name: game.Name,
			LastUpdated: game.LastModifiedDate,
			Players: users.ToDictionary(p => p.Id.ToString(), p => p.Name),
			Id: game.Id,
			TypeInfo: gameTypes.All.TryGetValue(game.Type, out var gameType)
				? await ToGameTypeDetails(gameType, gameTypes)
			: throw new NotSupportedException("Unknown game type")
		);
	}

	public static async Task<GameTypeDetails> ToGameTypeDetails(IGameType gameType, GameTypes gameTypes)
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

	protected override object ToKey(GameModel entity) => entity.Id;
}

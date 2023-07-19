using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Realtime;
using GameDocumentEngine.Server.Users;
using Json.Patch;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Security.Claims;

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
			Players = { new GameUserModel { User = user, Role = "owner" } },
		};
		dbContext.Add(game);
		await dbContext.SaveChangesAsync();
		return CreateGameActionResult.Ok(await GameModelChangeNotification.ToGameDetails(game, gameTypes));
	}

	protected override async Task<ListGamesActionResult> ListGames()
	{
		var games = await (from gameUser in dbContext.GameUsers
						   where gameUser.UserId == User.GetCurrentUserId()
						   select gameUser.Game).ToArrayAsync();
		return ListGamesActionResult.Ok(games.Select(g => new GameSummary(g.Id, g.Name)));
	}

	protected override async Task<DeleteGameActionResult> DeleteGame(Guid gameId)
	{
		var gameRecord = await (from gameUser in dbContext.GameUsers
								where gameUser.GameId == gameId && gameUser.UserId == User.GetCurrentUserId()
								select gameUser.Game).SingleOrDefaultAsync();
		if (gameRecord == null) return DeleteGameActionResult.NotFound();
		// TODO - check permissions

		dbContext.Remove(gameRecord);
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

		return GetGameDetailsActionResult.Ok(await GameModelChangeNotification.ToGameDetails(gameRecord, gameTypes));
	}

	protected override Task<PatchGameActionResult> PatchGame(Guid gameId, JsonPatch patchGameBody)
	{
		// TODO: Implement patch game
		throw new NotImplementedException();
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

	protected override bool HasAddedMessage => false;
	protected override Task SendAddedMessage(IHubClients clients, GameModel result, object message) =>
		Task.CompletedTask;

	protected override Task SendDeletedMessage(IHubClients clients, GameModel original, object message) =>
		clients.Group(GroupNames.Game(original.Id)).SendAsync("GameDeleted", message);

	protected override Task SendModifiedMessage(IHubClients clients, GameModel original, object message) =>
		clients.Group(GroupNames.Game(original.Id)).SendAsync("GameChanged", message);

	protected override Task<GameDetails> ToApi(GameModel game) =>
		ToGameDetails(game, gameTypes);

	public static async Task<GameDetails> ToGameDetails(GameModel game, GameTypes gameTypes) =>
		new GameDetails(Name: game.Name,
			LastUpdated: game.LastModifiedDate,
			Players: game.Players.Select(p => p.User.Name),
			InviteUrl: "TODO",
			Id: game.Id,
			TypeInfo: gameTypes.All.TryGetValue(game.Type, out var gameType)
				? await ToGameTypeDetails(gameType, gameTypes)
			: throw new NotSupportedException("Unknown game type")
		);

	public static async Task<GameTypeDetails> ToGameTypeDetails(IGameType gameType, GameTypes gameTypes)
	{
		return new GameTypeDetails(
			Name: gameType.Name,
			ObjectTypes: await Task.WhenAll(
				gameType.ObjectTypes.Select(async obj => new GameObjectTypeDetails(
							Name: obj.Name,
							Scripts: (await Task.WhenAll(gameType.ObjectTypes.Select(gameTypes.ResolveGameObjectScripts))).SelectMany(a => a).Distinct()
				)))
		);
	}

	protected override object ToKey(GameModel entity) => entity.Id;
}

class GameUserModelChangeNotification : IEntityChangeNotifications<GameUserModel>
{
	public ValueTask SendChangeNotification(MessageIdProvider messageIdProvider, IHubClients clients, EntityEntry changedEntity)
	{
		var target = changedEntity.Entity as GameUserModel;
		if (target == null)
			return ValueTask.CompletedTask;

		messageIdProvider.Defer((messageId) => clients.Group(GroupNames.UserDirect(target.UserId)).SendAsync("GameListChanged", new { messageId }));
		messageIdProvider.Defer((messageId) => clients.Group(GroupNames.Game(target.GameId)).SendAsync("GameChanged", new { messageId, key = target.GameId }));

		return ValueTask.CompletedTask;
	}
}
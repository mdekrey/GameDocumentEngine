using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Users;
using Json.Patch;
using Microsoft.EntityFrameworkCore;
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
			Players = { new GameUserModel { User = user } },
		};
		dbContext.Add(game);
		await dbContext.SaveChangesAsync();
		return CreateGameActionResult.Ok(await ToGameDetails(game));
	}

	private async Task<GameDetailsWithId> ToGameDetails(GameModel game) =>
		new GameDetailsWithId(Name: game.Name,
			LastUpdated: game.LastModifiedDate,
			Players: game.Players.Select(p => p.User.Name),
			InviteUrl: "TODO",
			Id: game.Id,
			TypeInfo: gameTypes.All.TryGetValue(game.Type, out var gameType) ? await ToGameTypeDetails(gameType, gameTypes) : throw new NotSupportedException("Unknown game type")
		);

	public static async Task<GameTypeDetails> ToGameTypeDetails(IGameType gameType, GameTypes gameTypes)
	{
		return new GameTypeDetails(
			Name: gameType.Name,
			ObjectTypes: await Task.WhenAll(gameType.ObjectTypes.Select(async obj => new GameObjectTypeDetails(Name: obj.Name, Scripts: (await Task.WhenAll(gameType.ObjectTypes.Select(gameObjectType => gameTypes.ResolveGameObjectScripts(gameObjectType)))).SelectMany(a => a).Distinct())))
		);
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

		return GetGameDetailsActionResult.Ok(await ToGameDetails(gameRecord));
	}

	protected override Task<PatchGameActionResult> PatchGame(Guid gameId, JsonPatch patchGameBody)
	{
		// TODO: Implement patch game
		throw new NotImplementedException();
	}

	protected override async Task<GetGameTypeActionResult> GetGameType(string gameType)
	{
		return gameTypes.All.TryGetValue(gameType, out var r)
			? GetGameTypeActionResult.Ok(await ToGameTypeDetails(r, gameTypes))
			: GetGameTypeActionResult.NotFound();
	}
}

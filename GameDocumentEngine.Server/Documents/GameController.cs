using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Users;
using Json.Patch;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GameDocumentEngine.Server.Documents;

public class GameController : Api.GameControllerBase
{
	private readonly IEnumerable<IGameType> gameTypes;
	private readonly DocumentDbContext dbContext;

	public GameController(IEnumerable<IGameType> gameTypes, Data.DocumentDbContext dbContext)
	{
		this.gameTypes = gameTypes;
		this.dbContext = dbContext;
	}

	protected override async Task<CreateGameActionResult> CreateGame(CreateGameDetails createGameBody)
	{
		if (!ModelState.IsValid || !gameTypes.Any(gt => gt.Name == createGameBody.Type))
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
		return CreateGameActionResult.Ok(ToGameDetails(game));
	}

	private GameDetailsWithId ToGameDetails(GameModel game) =>
		new GameDetailsWithId(game.Name,
			game.LastModifiedDate,
			game.Players.Select(p => p.User.Name),
			"TODO",
			game.Id);

	protected override async Task<ListGamesActionResult> ListGames()
	{
		var games = await (from gameUser in dbContext.GameUsers
						   where gameUser.User.GoogleNameId == User.GetGoogleNameIdOrThrow()
						   select gameUser.Game).ToArrayAsync();
		return ListGamesActionResult.Ok(games.Select(g => new GameSummary(g.Id, g.Name)));
	}

	protected override async Task<DeleteGameActionResult> DeleteGame(Guid gameId)
	{
		var gameRecord = await (from gameUser in dbContext.GameUsers
								where gameUser.GameId == gameId && gameUser.User.GoogleNameId == User.GetGoogleNameIdOrThrow()
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
								where gameUser.GameId == gameId && gameUser.User.GoogleNameId == User.GetGoogleNameIdOrThrow()
								select gameUser.Game)
			.SingleOrDefaultAsync();
		if (gameRecord == null) return GetGameDetailsActionResult.NotFound();

		return GetGameDetailsActionResult.Ok(new GameDetails(
			Name: gameRecord.Name,
			LastUpdated: gameRecord.LastModifiedDate,
			gameRecord.Players.Select(p => p.User.Name),
			"TODO"
		));
	}

	protected override Task<PatchGameActionResult> PatchGame(Guid gameId, JsonPatch patchGameBody)
	{
		throw new NotImplementedException();
	}
}

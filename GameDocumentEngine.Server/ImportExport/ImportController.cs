using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents;
using GameDocumentEngine.Server.Users;
using System.IO.Compression;
using System.Security.AccessControl;

namespace GameDocumentEngine.Server.ImportExport;

public class ImportController : GameImportControllerBase
{
	private readonly Documents.GameTypes gameTypes;
	private readonly DocumentDbContext dbContext;

	public ImportController(
		Documents.GameTypes gameTypes,
		DocumentDbContext dbContext)
	{
		this.gameTypes = gameTypes;
		this.dbContext = dbContext;
	}

	protected override async Task<ImportGameActionResult> ImportGame(Stream importGameBody)
	{
		if (!ModelState.IsValid)
			return ImportGameActionResult.BadRequest();
		using var zipArchive = new ZipArchive(importGameBody, ZipArchiveMode.Read, false);

		if (!await GameArchiveVersion1.IsValid(zipArchive))
			return ImportGameActionResult.BadRequest();

		var archiveFactory = new GameArchiveVersion1(dbContext);
		var user = await dbContext.GetCurrentUserOrThrow(User);
		var game = await archiveFactory.UnpackNewGame(zipArchive);
		if (game == null)
			return ImportGameActionResult.BadRequest();
		if (!gameTypes.All.TryGetValue(game.Type, out var gameType))
			return ImportGameActionResult.BadRequest();

		var gameUser = new GameUserModel { User = user, Role = gameType.DefaultNewGameRole };
		game.Players.Add(gameUser);

		dbContext.Add(game);
		await dbContext.SaveChangesAsync();

		return ImportGameActionResult.Ok(new ImportGameResponse(game.Id));
	}
}
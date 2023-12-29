using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents;
using GameDocumentEngine.Server.Users;
using Microsoft.EntityFrameworkCore;
using System.IO.Compression;
using System.Security.AccessControl;

namespace GameDocumentEngine.Server.ImportExport;

public class ImportController : GameImportControllerBase
{
	private readonly Documents.GameTypes gameTypes;
	private readonly DocumentDbContext dbContext;
	private readonly GamePermissionSetResolver permissionSetResolver;

	public ImportController(
		Documents.GameTypes gameTypes,
		DocumentDbContext dbContext,
		GamePermissionSetResolver permissionSetResolver)
	{
		this.gameTypes = gameTypes;
		this.dbContext = dbContext;
		this.permissionSetResolver = permissionSetResolver;
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

		return ImportGameActionResult.Ok(new ImportGameResponse((Identifier)game.Id));
	}

	protected override async Task<ImportIntoExistingGameActionResult> ImportIntoExistingGame(Identifier gameId, Stream importIntoExistingGameBody)
	{
		if (!ModelState.IsValid)
			return ImportIntoExistingGameActionResult.BadRequest();
		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId.Value);
		if (permissions == null) return ImportIntoExistingGameActionResult.NotFound();
		if (!permissions.HasPermission(GameSecurity.ImportIntoGame(gameId.Value))) return ImportIntoExistingGameActionResult.Forbidden();
		var game = await dbContext.Games.FirstAsync(g => g.Id == gameId.Value);

		using var zipArchive = new ZipArchive(importIntoExistingGameBody, ZipArchiveMode.Read, false);

		if (!await GameArchiveVersion1.IsValid(zipArchive))
			return ImportIntoExistingGameActionResult.BadRequest();

		var archiveFactory = new GameArchiveVersion1(dbContext);
		if (!await archiveFactory.UnpackIntoGame(zipArchive, game))
			return ImportIntoExistingGameActionResult.BadRequest();

		await dbContext.SaveChangesAsync();
		return ImportIntoExistingGameActionResult.Ok();
	}
}
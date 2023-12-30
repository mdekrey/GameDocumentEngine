using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents;
using GameDocumentEngine.Server.Users;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.IO.Compression;
using System.Security.AccessControl;

namespace GameDocumentEngine.Server.ImportExport;

public partial class ImportController : GameImportControllerBase
{
	private readonly Documents.GameTypes gameTypes;
	private readonly DocumentDbContext dbContext;
	private readonly GamePermissionSetResolver permissionSetResolver;
	private readonly IReadOnlyList<Func<ZipArchive, Task<GameArchiveVersion1?>>> archiveVersions;

	public ImportController(
		Documents.GameTypes gameTypes,
		DocumentDbContext dbContext,
		GamePermissionSetResolver permissionSetResolver)
	{
		this.gameTypes = gameTypes;
		this.dbContext = dbContext;
		this.permissionSetResolver = permissionSetResolver;

		this.archiveVersions = new Func<ZipArchive, Task<GameArchiveVersion1?>>[]
		{
			async (archive) =>
			{
				if (!await GameArchiveVersion1.IsValid(archive))
					return null;
				return new GameArchiveVersion1(dbContext);
			}
		};
	}

	private async Task<GameArchiveVersion1?> SelectVersion(ZipArchive zipArchive)
	{
		foreach (var versionFactory in archiveVersions)
		{
			var factory = await versionFactory(zipArchive);
			if (factory == null) continue;
			return factory;
		}
		return null;
	}

	protected override async Task<ImportGameActionResult> ImportGame(Stream importGameBody)
	{
		if (!ModelState.IsValid)
			return ImportGameActionResult.BadRequest();
		using var zipArchive = new ZipArchive(importGameBody, ZipArchiveMode.Read, false);
		var archiveFactory = await SelectVersion(zipArchive);
		if (archiveFactory == null)
			return ImportGameActionResult.BadRequest();

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

	protected override Task<ImportIntoExistingGameActionResult> ImportIntoExistingGame(Identifier gameId, Stream importIntoExistingGameBody) =>
		ImportIntoExistingGame(gameId, importIntoExistingGameBody, new ImportIntoExistingGameOptions(true, null, null));

	protected async Task<ImportIntoExistingGameActionResult> ImportIntoExistingGameMultipartFormData(Identifier gameId, ImportIntoExistingGameMultipartFormDataRequest importIntoExistingGameBody)
	{
		using var stream = importIntoExistingGameBody.Archive.OpenReadStream();
		return await ImportIntoExistingGame(gameId, stream, importIntoExistingGameBody.Options);
	}

	protected override async Task<InspectGameArchiveActionResult> InspectGameArchive(Identifier gameId, Stream inspectGameArchiveBody)
	{
		if (!ModelState.IsValid)
			return InspectGameArchiveActionResult.BadRequest();
		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId.Value);
		if (permissions == null) return InspectGameArchiveActionResult.NotFound();
		if (!permissions.HasPermission(GameSecurity.ImportIntoGame(gameId.Value))) return InspectGameArchiveActionResult.Forbidden();

		using var zipArchive = new ZipArchive(inspectGameArchiveBody, ZipArchiveMode.Read, false);
		var archiveFactory = await SelectVersion(zipArchive);
		if (archiveFactory == null)
			return InspectGameArchiveActionResult.BadRequest();

		var details = await archiveFactory.GetArchiveDetails(zipArchive);
		if (details == null)
			return InspectGameArchiveActionResult.BadRequest();
		return InspectGameArchiveActionResult.Ok(details);
	}

	private async Task<ImportIntoExistingGameActionResult> ImportIntoExistingGame(Identifier gameId, Stream stream, ImportIntoExistingGameOptions options)
	{
		if (!ModelState.IsValid)
			return ImportIntoExistingGameActionResult.BadRequest();
		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId.Value);
		if (permissions == null) return ImportIntoExistingGameActionResult.NotFound();
		if (!permissions.HasPermission(GameSecurity.ImportIntoGame(gameId.Value))) return ImportIntoExistingGameActionResult.Forbidden();

		using var zipArchive = new ZipArchive(stream, ZipArchiveMode.Read, false);
		var archiveFactory = await SelectVersion(zipArchive);
		if (archiveFactory == null)
			return ImportIntoExistingGameActionResult.BadRequest();

		var game = await dbContext.Games.FirstAsync(g => g.Id == gameId.Value);
		if (!await archiveFactory.UnpackIntoGame(zipArchive, game, options))
			return ImportIntoExistingGameActionResult.BadRequest();

		await dbContext.SaveChangesAsync();
		return ImportIntoExistingGameActionResult.Ok();
	}
}



public partial class ImportController
{

	/// <param name="gameId"></param>
	/// <param name="importIntoExistingGameBody"></param>
	[global::Microsoft.AspNetCore.Mvc.HttpPost]
	[global::Microsoft.AspNetCore.Mvc.Route("/game/{gameId}/import")]
	[global::Microsoft.AspNetCore.Mvc.Consumes("multipart/form-data")]
	// Success
	[global::Microsoft.AspNetCore.Mvc.ProducesResponseType(200)] // 
																 // Invalid zip provided
	[global::Microsoft.AspNetCore.Mvc.ProducesResponseType(400)] // 
																 // User was not authenticated
	[global::Microsoft.AspNetCore.Mvc.ProducesResponseType(401)] // 
																 // User did not have permissions
	[global::Microsoft.AspNetCore.Mvc.ProducesResponseType(403)] // 
																 // Game not found
	[global::Microsoft.AspNetCore.Mvc.ProducesResponseType(404)] // 
	[global::Microsoft.AspNetCore.Authorization.Authorize(Policy = "AuthenticatedUser")]
	public async global::System.Threading.Tasks.Task<global::Microsoft.AspNetCore.Mvc.IActionResult> ImportIntoExistingGamemultipartFormDataTypeSafeEntry(
		[global::Microsoft.AspNetCore.Mvc.FromRoute(Name = "gameId"), global::System.ComponentModel.DataAnnotations.Required] global::GameDocumentEngine.Server.Api.Identifier gameId,
		[global::Microsoft.AspNetCore.Mvc.FromForm, global::System.ComponentModel.DataAnnotations.Required] ImportIntoExistingGameMultipartFormDataRequest importIntoExistingGameBody
	) => (await ImportIntoExistingGameMultipartFormData(gameId, importIntoExistingGameBody)).ActionResult;

}
using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO.Compression;
using System.Text.RegularExpressions;

namespace GameDocumentEngine.Server.ImportExport;

public partial class ExportController : GameExportControllerBase
{
	private readonly DocumentDbContext dbContext;
	private readonly GamePermissionSetResolver permissionSetResolver;

	[GeneratedRegex("[^a-zA-Z0-9]")]
	private static partial Regex CleanseName();

	public ExportController(
		DocumentDbContext dbContext,
		GamePermissionSetResolver permissionSetResolver)
	{
		this.dbContext = dbContext;
		this.permissionSetResolver = permissionSetResolver;
	}

	protected override async Task<GetGameExportActionResult> GetGameExport(Identifier gameId)
	{
		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId.Value);
		if (permissions == null) return GetGameExportActionResult.NotFound();
		if (!permissions.HasPermission(GameSecurity.ExportGame(gameId.Value))) return GetGameExportActionResult.Forbidden();
		var game = await dbContext.Games.FirstAsync(g => g.Id == gameId.Value);

		var archiveFactory = new GameArchiveVersion1(dbContext);

		var archive = new MemoryStream();
		await archiveFactory.AddToArchive(gameId.Value, archive);
		archive.Position = 0;
		var headerContentDisposition = $"attachment; filename=\"Export-{CleanseName().Replace(game.Name, "")}.vaultvtt\"";
		return GetGameExportActionResult.Ok(archive, headerContentDisposition: headerContentDisposition);
	}
}

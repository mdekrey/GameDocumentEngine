using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Json;
using GameDocumentEngine.Server.Security;
using GameDocumentEngine.Server.Tracing;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Text.Json;
using static GameDocumentEngine.Server.Documents.GameSecurity;

namespace GameDocumentEngine.Server.Documents;

class DocumentModelApiMapper : IPermissionedApiMapper<DocumentModel, Api.DocumentDetails>
{
	private readonly DocumentUserLoader userLoader;

	public DocumentModelApiMapper(DocumentUserLoader userLoader)
	{
		this.userLoader = userLoader;
	}

	public async Task<DocumentDetails> ToApi(DocumentDbContext dbContext, DocumentModel entity, PermissionSet permissionSet, DbContextChangeUsage usage)
	{
		using var activity = TracingHelper.StartActivity($"{nameof(DocumentModelApiMapper)}.{nameof(ToApi)}");
		var resultDocument = dbContext.Entry(entity).AtState(usage);

		var documentUsersCollection = await LoadDocumentUsers(dbContext, entity);

		// mask parts of document data based on permissions
		var jsonPaths = permissionSet.Permissions
			.MatchingPermissionsParams(ReadDocumentDetailsPrefix(entity.GameId, entity.Id))
			.Append("$.details")
			.ToArray();

		var filtered = JsonSerializer.SerializeToNode(new { details = resultDocument.Details })
				?.FilterNode(jsonPaths)["details"]
				?? throw new InvalidDataException("Json path excluded details object");

		// re-scan change detection for users - the `documentUsersCollection` doesn't get deleted items
		var permissionEntries = from entry in dbContext.ChangeTracker.Entries<DocumentUserModel>()
								where entry.Entity.GameId == entity.GameId && entry.Entity.DocumentId == entity.Id
								select entry;

		return new DocumentDetails(
			GameId: (Identifier)resultDocument.GameId,
			Id: (Identifier)resultDocument.Id,
			Version: resultDocument.Version,
			Name: resultDocument.Name,
			FolderId: (Identifier?)resultDocument.FolderId,
			Type: resultDocument.Type,
			Details: filtered,
			UserRoles: permissionEntries
				.AtState(usage)
				.ToDictionary(
					p => Identifier.ToString(p.PlayerId),
					p => p.Role
				),
			Permissions: permissionSet.Permissions.Permissions
		);
	}

	private async Task<CollectionEntry<DocumentModel, DocumentUserModel>> LoadDocumentUsers(DocumentDbContext dbContext, DocumentModel entity)
	{
		await userLoader.EnsureDocumentUsersLoaded(dbContext, entity);
		return dbContext
			.Entry(entity)
			.Collection(game => game.Players);
	}

	public object ToKey(DocumentModel entity) => new { GameId = Identifier.ToString(entity.GameId), Id = Identifier.ToString(entity.Id) };
}

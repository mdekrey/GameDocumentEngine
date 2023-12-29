using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents.Types;
using GameDocumentEngine.Server.Json;
using GameDocumentEngine.Server.Security;
using GameDocumentEngine.Server.Tracing;
using GameDocumentEngine.Server.Users;
using Json.Patch;
using Json.Schema;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using System.Collections.Specialized;
using System.Web;
using static GameDocumentEngine.Server.Documents.GameSecurity;

namespace GameDocumentEngine.Server.Documents;

public class DocumentController : Api.DocumentControllerBase
{
	const int defaultLimit = 100;

	private readonly Documents.GameTypes allGameTypes;
	private readonly DocumentDbContext dbContext;
	private readonly JsonSchemaResolver schemaResolver;
	private readonly IPermissionedApiMapper<DocumentModel, DocumentDetails> documentMapper;
	private readonly GamePermissionSetResolver permissionSetResolver;
	private readonly DocumentUserLoader userLoader;
	private readonly IDataProtector cursorProtector;

	public DocumentController(
		Documents.GameTypes allGameTypes,
		DocumentDbContext dbContext,
		JsonSchemaResolver schemaResolver,
		IPermissionedApiMapper<DocumentModel, DocumentDetails> documentMapper,
		GamePermissionSetResolver permissionSetResolver,
		DocumentUserLoader userLoader,
		IDataProtectionProvider protector)
	{
		this.allGameTypes = allGameTypes;
		this.dbContext = dbContext;
		this.schemaResolver = schemaResolver;
		this.documentMapper = documentMapper;
		this.permissionSetResolver = permissionSetResolver;
		this.userLoader = userLoader;
		this.cursorProtector = protector.CreateProtector(nameof(cursorProtector));
	}

	protected override async Task<CreateDocumentActionResult> CreateDocument(Identifier gameId, CreateDocumentDetails createDocumentBody)
	{
		if (!ModelState.IsValid) return CreateDocumentActionResult.BadRequest("Unable to parse response");
		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId.Value);
		if (permissions == null) return CreateDocumentActionResult.NotFound();
		if (!permissions.HasPermission(GameSecurity.CreateDocument(gameId.Value))) return CreateDocumentActionResult.Forbidden();

		var game = await dbContext.Games.FirstAsync(g => g.Id == gameId.Value);

		var document = new DocumentModel
		{
			Game = game,
			GameId = gameId.Value,
			Details = createDocumentBody.Details,
			Name = createDocumentBody.Name,
			Type = createDocumentBody.Type,
		};

		var docType = GetDocumentType(document);
		if (docType == null)
			return CreateDocumentActionResult.BadRequest("Unknown document type for game");

		foreach (var entry in createDocumentBody.InitialRoles)
		{
			document.Players.Add(new DocumentUserModel
			{
				GameId = game.Id,
				PlayerId = Identifier.FromString(entry.Key).Value,
				Role = entry.Value,
			});
		}

		if (!document.Players.Any(p => p.PlayerId == permissions.GameUser.PlayerId))
		{
			document.Players.Add(new DocumentUserModel
			{
				GameId = game.Id,
				PlayerId = permissions.GameUser.PlayerId,
				Role = docType.CreatorPermissionLevel
			});
		}

		var schema = await schemaResolver.GetOrLoadSchema(docType);
		var results = schema.Evaluate(createDocumentBody.Details, new EvaluationOptions { OutputFormat = OutputFormat.Hierarchical });
		if (!results.IsValid)
		{
			var errors = results.AllErrors();
			return CreateDocumentActionResult.BadRequest($"Errors from schema: {string.Join('\n', errors.Select(kvp => $"{kvp.Pointer}: [{kvp.ErrorType}] {kvp.Message}"))}");
		}

		dbContext.Add(document);
		await dbContext.SaveChangesAsync();

		return CreateDocumentActionResult.Ok(await ToDocumentDetails(document, permissions));
	}

	protected override async Task<ListDocumentsActionResult> ListDocuments(Identifier gameId, Identifier? folderId, string? type, string? search, int? limit, string? cursor)
	{
		if (!ModelState.IsValid) return ListDocumentsActionResult.NotFound();
		var viewAny = await permissionSetResolver.HasPermission(User, gameId.Value, SeeAnyDocument(gameId.Value));
		if (viewAny == null) return ListDocumentsActionResult.NotFound();

		var playerId = (await dbContext.GetPlayerOrThrow(User, gameId.Value)).PlayerId;
		IQueryable<DocumentModel> baseDocuments = viewAny.Value
			? dbContext.Documents.Where(doc => doc.GameId == gameId.Value)
			: from gameUser in dbContext.DocumentUsers
			  where gameUser.PlayerId == playerId && gameUser.GameId == gameId.Value
			  select gameUser.Document;

		string? afterName = null;
		NameValueCollection cursorParts;
		if (cursor != null)
		{
			cursorParts = HttpUtility.ParseQueryString(cursorProtector.Unprotect(cursor));
			type = cursorParts.GetValues(nameof(type)) is [string cursorDocType] ? cursorDocType : null;
			folderId = cursorParts.GetValues(nameof(folderId)) is [string cursorFolder] ? Identifier.FromString(cursorFolder) : null;
			search = cursorParts.GetValues(nameof(search)) is [string cursorSearch] ? cursorSearch : null;
			afterName = cursorParts.GetValues(nameof(afterName)) is [string cursorAfterName] ? cursorAfterName : null;
		}
		else
		{
			cursorParts = HttpUtility.ParseQueryString("");
		}

		if (type != null)
		{
			baseDocuments = baseDocuments.Where(doc => doc.Type == type);
			cursorParts.Set(nameof(type), type);
		}

		if (folderId != null)
		{
			var isEmpty = folderId.Value == 0;
			baseDocuments = baseDocuments.Where(
				isEmpty
					? doc => doc.FolderId == null
					: doc => doc.FolderId == folderId.Value
			);
			cursorParts.Set(nameof(folderId), folderId.ToString());
		}
		if (search != null)
		{
			baseDocuments = baseDocuments.Where(doc => doc.Name.Contains(search, StringComparison.InvariantCultureIgnoreCase));
			cursorParts.Set(nameof(search), search);
		}
		var count = await baseDocuments.CountAsync();
		baseDocuments = baseDocuments.OrderBy(doc => doc.Name);
		if (afterName != null)
			baseDocuments = baseDocuments.Where(d => string.Compare(d.Name, afterName) > 0);
		var remainingCount = await baseDocuments.CountAsync();
		baseDocuments = baseDocuments.Take(limit ?? defaultLimit);

		var documents = await baseDocuments.ToArrayAsync();
		var hasMore = remainingCount > documents.Length;
		string? nextCursor;
		if (hasMore)
		{
			cursorParts.Set(nameof(afterName), documents.Last().Name);
			nextCursor = cursorProtector.Protect(cursorParts.ToString() ?? throw new InvalidOperationException("Cursor could not be created"));
		}
		else
		{
			nextCursor = null;
		}

		return ListDocumentsActionResult.Ok(new ListDocumentsResponse(
			Data: documents.ToDictionary(
				d => Identifier.ToString(d.Id),
				doc => new DocumentSummary((Identifier)doc.Id, doc.Name, doc.Type, (Identifier?)doc.FolderId)
			),
			Pagination: new PaginatedDetails(
				TotalRecords: count,
				NextCursor: nextCursor
			)
		));
	}

	protected override async Task<DeleteDocumentActionResult> DeleteDocument(Identifier gameId, Identifier id)
	{
		switch (await permissionSetResolver.HasPermission(User, gameId.Value, id.Value, GameSecurity.DeleteDocument(gameId.Value, id.Value)))
		{
			case null: return DeleteDocumentActionResult.NotFound();
			case false: return DeleteDocumentActionResult.Forbidden();
		}

		var document = await dbContext.Documents.Include(d => d.Players).FirstOrDefaultAsync(d => d.Id == id.Value);
		if (document == null) return DeleteDocumentActionResult.NotFound();

		dbContext.RemoveRange(document.Players);
		dbContext.Remove(document);
		await dbContext.SaveChangesAsync();
		return DeleteDocumentActionResult.Ok();
	}

	protected override async Task<GetDocumentActionResult> GetDocument(Identifier gameId, Identifier id)
	{
		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId.Value, id.Value);
		if (permissions?.HasPermission(SeeDocument(gameId.Value, id.Value)) is not true) return GetDocumentActionResult.NotFound();

		var document = permissions.GameUser.Documents.FirstOrDefault(du => du.GameId == gameId.Value && du.DocumentId == id.Value)?.Document
			?? await (from doc in dbContext.Documents
					  where doc.GameId == gameId.Value && doc.Id == id.Value
					  select doc).SingleOrDefaultAsync();
		if (document == null) return GetDocumentActionResult.NotFound();

		return GetDocumentActionResult.Ok(await ToDocumentDetails(document, permissions));
	}

	protected override async Task<PatchDocumentActionResult> PatchDocument(Identifier gameId, Identifier id, JsonPatch patchDocumentBody)
	{
		if (!ModelState.IsValid) return PatchDocumentActionResult.BadRequest("Unable to parse JSON Patch");
		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId.Value, id.Value);
		if (permissions?.HasPermission(SeeDocument(gameId.Value, id.Value)) is not true) return PatchDocumentActionResult.NotFound();

		var document = permissions.GameUser.Documents.FirstOrDefault(du => du.GameId == gameId.Value && du.DocumentId == id.Value)?.Document
			?? await dbContext.Documents.Include(doc => doc.Game).FirstAsync(doc => doc.Id == id.Value);
		// check permissions with patch to see if allowed
		var jsonPaths = permissions.Permissions.MatchingPermissionsParams(WriteDocumentDetailsPrefix(gameId.Value, id.Value));
		if (!patchDocumentBody.HasOnlyAllowedPaths(EditableDocumentModel.Create(document), jsonPaths))
			return PatchDocumentActionResult.Forbidden();

		var docType = GetDocumentType(document);
		if (docType == null)
			return PatchDocumentActionResult.BadRequest("Unknown document type for game");

		using (TracingHelper.StartActivity("Apply Patch"))
			if (!patchDocumentBody.ApplyModelPatch(document, EditableDocumentModel.Create, dbContext, out var error))
				return error is PatchTestError
					? PatchDocumentActionResult.Conflict()
					: PatchDocumentActionResult.BadRequest(error.Message ?? "Unknown error");

		using (TracingHelper.StartActivity("Validate final document"))
		{
			var schema = await schemaResolver.GetOrLoadSchema(docType);
			var results = schema.Evaluate(document.Details, new EvaluationOptions { OutputFormat = OutputFormat.Hierarchical });
			if (!results.IsValid)
			{
				var errors = results.AllErrors();
				return PatchDocumentActionResult.BadRequest($"Errors from schema: {string.Join('\n', errors.Select(kvp => $"{kvp.Pointer}: [{kvp.ErrorType}] {kvp.Message}"))}");
			}
		}

		using (TracingHelper.StartActivity("Save changes"))
			await dbContext.SaveChangesAsync();

		return PatchDocumentActionResult.Ok(await ToDocumentDetails(document, permissions));
	}

	private IGameObjectType? GetDocumentType(DocumentModel document)
	{
		var gameType = allGameTypes.All[document.Game.Type];
		return gameType.ObjectTypes.FirstOrDefault(t => t.Key == document.Type);
	}

	protected override async Task<UpdateDocumentRoleAssignmentsActionResult> UpdateDocumentRoleAssignments(Identifier gameId, Identifier id, Dictionary<string, string?> updateDocumentRoleAssignmentsBody)
	{
		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId.Value, id.Value);
		if (permissions == null) return UpdateDocumentRoleAssignmentsActionResult.NotFound();
		if (!permissions.HasPermission(UpdateDocumentUserAccess(gameId.Value, id.Value))) return UpdateDocumentRoleAssignmentsActionResult.Forbidden();
		var canUpdateSelf = permissions.HasPermission(UpdateDocumentAccessForSelf(gameId.Value, id.Value));

		var document = permissions.GameUser.Documents.FirstOrDefault(du => du.GameId == gameId.Value && du.DocumentId == id.Value)?.Document;
		if (document == null)
			document = await dbContext.Documents.Include(d => d.Game).Include(d => d.Players).Where(d => d.Id == id.Value && d.GameId == gameId.Value).SingleAsync();
		else
			await userLoader.EnsureDocumentUsersLoaded(dbContext, document);

		var docType = GetDocumentType(document);
		if (docType == null)
			return UpdateDocumentRoleAssignmentsActionResult.BadRequest();

		var gameUserRecords = document.Players
			?? await (from documentUser in dbContext.DocumentUsers
					  where documentUser.GameId == gameId.Value && documentUser.DocumentId == id.Value
					  select documentUser).ToListAsync();
		foreach (var kvp in updateDocumentRoleAssignmentsBody)
		{
			var key = Identifier.FromString(kvp.Key).Value;
			if (key == permissions.GameUser.PlayerId && !canUpdateSelf)
				// Can't update your own permissions!
				return UpdateDocumentRoleAssignmentsActionResult.Forbidden();
			var modifiedUser = gameUserRecords.FirstOrDefault(u => u.PlayerId == key);
			if (kvp.Value == null)
			{
				if (modifiedUser != null)
				{
					dbContext.DocumentUsers.Remove(modifiedUser);
					gameUserRecords.Remove(modifiedUser);
				}
				continue;
			}
			else if (!docType.PermissionLevels.Contains(kvp.Value))
				return UpdateDocumentRoleAssignmentsActionResult.BadRequest();
			else if (modifiedUser == null)
			{
				modifiedUser = new DocumentUserModel { PlayerId = key, GameId = gameId.Value, DocumentId = id.Value, Role = kvp.Value };
				gameUserRecords.Add(modifiedUser);
			}
			else modifiedUser.Role = kvp.Value;
		}
		await dbContext.SaveChangesAsync();
		return UpdateDocumentRoleAssignmentsActionResult.Ok(
			gameUserRecords.ToDictionary(gu => Identifier.ToString(gu.PlayerId), gu => gu.Role)
		);
	}

	private Task<DocumentDetails> ToDocumentDetails(DocumentModel document, PermissionSet permissionSet) =>
		documentMapper.ToApi(dbContext, document, permissionSet, DbContextChangeUsage.AfterChange);
}

using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents.Types;
using GameDocumentEngine.Server.Realtime;
using GameDocumentEngine.Server.Security;
using GameDocumentEngine.Server.Users;
using Json.Patch;
using Json.Schema;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using static GameDocumentEngine.Server.Documents.GameSecurity;

namespace GameDocumentEngine.Server.Documents;

public class DocumentController : Api.DocumentControllerBase
{
	private readonly Documents.GameTypes allGameTypes;
	private readonly DocumentDbContext dbContext;
	private readonly JsonSchemaResolver schemaResolver;
	private readonly IPermissionedApiMapper<DocumentModel, DocumentDetails> documentMapper;
	private readonly GamePermissionSetResolver permissionSetResolver;

	public DocumentController(
		Documents.GameTypes allGameTypes,
		DocumentDbContext dbContext,
		JsonSchemaResolver schemaResolver,
		IPermissionedApiMapper<DocumentModel, DocumentDetails> documentMapper,
		GamePermissionSetResolver permissionSetResolver)
	{
		this.allGameTypes = allGameTypes;
		this.dbContext = dbContext;
		this.schemaResolver = schemaResolver;
		this.documentMapper = documentMapper;
		this.permissionSetResolver = permissionSetResolver;
	}

	protected override async Task<CreateDocumentActionResult> CreateDocument(Guid gameId, CreateDocumentDetails createDocumentBody)
	{
		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId);
		if (permissions == null) return CreateDocumentActionResult.NotFound();
		if (!permissions.HasPermission(GameSecurity.CreateDocument(gameId))) return CreateDocumentActionResult.Forbidden();

		var game = await dbContext.Games.FirstAsync(g => g.Id == gameId);
		var gameType = allGameTypes.All[game.Type];

		var docType = gameType.ObjectTypes.FirstOrDefault(t => t.Name == createDocumentBody.Type);
		if (docType == null)
			return CreateDocumentActionResult.BadRequest("Unknown document type for game");

		var schema = await schemaResolver.GetOrLoadSchema(docType);
		var results = schema.Evaluate(createDocumentBody.Details, new EvaluationOptions { OutputFormat = OutputFormat.Hierarchical });
		if (!results.IsValid)
		{
			var errors = results.Errors;
			if (errors == null)
				return CreateDocumentActionResult.BadRequest("Unable to verify request");
			return CreateDocumentActionResult.BadRequest($"Errors from schema: {string.Join('\n', errors.Select(kvp => kvp.Key + ": " + kvp.Value))}");
		}

		var document = new DocumentModel
		{
			GameId = gameId,
			Details = createDocumentBody.Details,
			Name = createDocumentBody.Name,
			Type = createDocumentBody.Type,
			Players = { new DocumentUserModel
			{
				GameId = game.Id,
				UserId = User.GetUserIdOrThrow(),
				Role = docType.CreatorPermissionLevel
			} },
		};
		dbContext.Add(document);
		await dbContext.SaveChangesAsync();

		return CreateDocumentActionResult.Ok(await ToDocumentDetails(document, permissions));
	}

	protected override async Task<ListDocumentsActionResult> ListDocuments(Guid gameId)
	{
		var viewAny = await permissionSetResolver.HasPermission(User, gameId, SeeAnyDocument(gameId));
		if (viewAny == null) return ListDocumentsActionResult.NotFound();

		var documents = await (viewAny.Value
			? dbContext.Documents.Where(doc => doc.GameId == gameId)
			: from gameUser in dbContext.DocumentUsers
			  where gameUser.UserId == User.GetCurrentUserId() && gameUser.GameId == gameId
			  select gameUser.Document)
			  .Select(doc => new DocumentSummary(doc.Id, doc.Name, doc.Type)).ToArrayAsync();

		return ListDocumentsActionResult.Ok(documents.ToDictionary(d => d.Id.ToString()));
	}

	protected override async Task<DeleteDocumentActionResult> DeleteDocument(Guid gameId, Guid id)
	{
		switch (await permissionSetResolver.HasPermission(User, gameId, id, GameSecurity.DeleteDocument(gameId, id)))
		{
			case null: return DeleteDocumentActionResult.NotFound();
			case false: return DeleteDocumentActionResult.Forbidden();
		}

		var document = await dbContext.Documents.Include(d => d.Players).FirstOrDefaultAsync(d => d.Id == id);
		if (document == null) return DeleteDocumentActionResult.NotFound();

		dbContext.RemoveRange(document.Players);
		dbContext.Remove(document);
		await dbContext.SaveChangesAsync();
		return DeleteDocumentActionResult.Ok();
	}

	protected override async Task<GetDocumentActionResult> GetDocument(Guid gameId, Guid id)
	{
		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId, id);
		if (permissions?.HasPermission(SeeDocument(gameId, id)) is not true) return GetDocumentActionResult.NotFound();

		var documentUserRecord = await (from documentUser in dbContext.DocumentUsers.Include(du => du.GameUser).Include(du => du.Document)
										where documentUser.DocumentId == id && documentUser.UserId == User.GetCurrentUserId() && documentUser.GameId == gameId
										select documentUser)
			.SingleOrDefaultAsync();
		if (documentUserRecord == null) return GetDocumentActionResult.NotFound();

		return GetDocumentActionResult.Ok(await ToDocumentDetails(documentUserRecord.Document, permissions));
	}

	protected override async Task<PatchDocumentActionResult> PatchDocument(Guid gameId, Guid id, JsonPatch patchDocumentBody)
	{
		if (!ModelState.IsValid) return PatchDocumentActionResult.BadRequest("Unable to parse JSON Patch");
		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId, id);
		if (permissions?.HasPermission(SeeDocument(gameId, id)) is not true) return PatchDocumentActionResult.NotFound();
		// TODO: check permissions with patch to see if allowed

		var document = await dbContext.Documents.Include(doc => doc.Game).FirstAsync(doc => doc.Id == id);

		var gameType = allGameTypes.All[document.Game.Type];
		var docType = gameType.ObjectTypes.FirstOrDefault(t => t.Name == document.Type);
		if (docType == null)
			return PatchDocumentActionResult.BadRequest("Unknown document type for game");

		if (!patchDocumentBody.ApplyModelPatch(document, EditableDocumentModel.Create, dbContext, out var error))
			return PatchDocumentActionResult.BadRequest(error.Message ?? "Unknown error");

		var schema = await schemaResolver.GetOrLoadSchema(docType);
		var results = schema.Evaluate(document.Details, new EvaluationOptions { OutputFormat = OutputFormat.Hierarchical });
		if (!results.IsValid)
		{
			var errors = results.Errors;
			if (errors == null)
				return PatchDocumentActionResult.BadRequest("Unable to verify request");
			return PatchDocumentActionResult.BadRequest($"Errors from schema: {string.Join('\n', errors.Select(kvp => kvp.Key + ": " + kvp.Value))}");
		}

		await dbContext.SaveChangesAsync();

		return PatchDocumentActionResult.Ok(await ToDocumentDetails(document, permissions));
	}

	private Task<DocumentDetails> ToDocumentDetails(DocumentModel document, PermissionSet permissionSet) =>
		documentMapper.ToApi(dbContext, document, permissionSet);
}

class DocumentModelApiMapper : IPermissionedApiMapper<DocumentModel, Api.DocumentDetails>
{
	public Task<DocumentDetails> ToApi(DocumentDbContext dbContext, DocumentModel entity, PermissionSet permissionSet) =>
		ToApi(dbContext, entity, DbContextChangeUsage.AfterChange);

	public Task<DocumentDetails> ToApiBeforeChanges(DocumentDbContext dbContext, DocumentModel entity, PermissionSet permissionSet) =>
		ToApi(dbContext, entity, DbContextChangeUsage.BeforeChange);

	private async Task<DocumentDetails> ToApi(DocumentDbContext dbContext, DocumentModel entity, DbContextChangeUsage usage)
	{
		var resultGame = dbContext.Entry(entity).AtState(usage);

		var documentUsers = dbContext
			.Entry(entity)
			.Collection(game => game.Players);
		await documentUsers.Query().LoadAsync();
		var documentUserEntries = documentUsers
			.Entries(dbContext)
			.AtStateEntries(usage);

		return ToApi(resultGame, documentUserEntries.AtState(usage));
	}

	private DocumentDetails ToApi(DocumentModel document, DocumentUserModel[] documentUsers) =>
		// TODO: mask parts of document data based on permissions
		new DocumentDetails(
			GameId: document.GameId,
			Id: document.Id,
			Name: document.Name,
			Type: document.Type,
			Details: document.Details,
			LastUpdated: document.LastModifiedDate,
			Players: documentUsers.ToDictionary(
					p => p.UserId.ToString(),
					p => p.Role
				)
		);

	public object ToKey(DocumentModel entity) => new { entity.GameId, entity.Id };
}

class DocumentModelChangeNotifications : PermissionedEntityChangeNotifications<DocumentModel, DocumentUserModel, Api.DocumentDetails>
{
	public DocumentModelChangeNotifications(
		IPermissionedApiMapper<DocumentModel, DocumentDetails> apiMapper,
		IApiChangeNotification<DocumentDetails> changeNotification)
		: base(apiMapper, changeNotification, du => du.UserId, du => du.Document)
	{
	}

	protected override async Task<IEnumerable<PermissionSet>> GetUsersFor(DocumentDbContext context, DocumentModel entity, DbContextChangeUsage changeState)
	{
		var documentUsers = await context.LoadEntityEntriesAsync<DocumentUserModel>(du => du.GameId == entity.GameId && du.DocumentId == entity.Id);
		var gameUsers = await context.LoadEntityEntriesAsync<GameUserModel>(g => g.GameId == entity.GameId);

		var gameUserPermissions = gameUsers.AtState(changeState)
			.Select(gameUser => gameUser.ToPermissionSet());

		return documentUsers.AtState(changeState)
			// TODO: load document permissions
			// TODO: merge with game permissions
			.Select(gameUser => new PermissionSet(gameUser.UserId, PermissionList.Empty));
	}
}

class DocumentApiChangeNotification : IApiChangeNotification<Api.DocumentDetails>
{
	private readonly IHubContext<GameDocumentsHub> hubContext;

	public DocumentApiChangeNotification(IHubContext<GameDocumentsHub> hubContext)
	{
		this.hubContext = hubContext;
	}

	public async Task SendAddedNotification(object apiKey, DocumentDetails newApiObject, Guid userId) =>
		await hubContext.User(userId).SendValue("Document", apiKey, newApiObject);

	public async Task SendDeletedNotification(object apiKey, Guid userId) =>
		await hubContext.User(userId).SendDeleted("Document", apiKey);

	public async Task SendModifiedNotification(object apiKey, DocumentDetails oldApiObject, DocumentDetails newApiObject, Guid userId)
	{
		await hubContext.User(userId).SendWithPatch("Document", apiKey, oldApiObject, newApiObject);
	}
}
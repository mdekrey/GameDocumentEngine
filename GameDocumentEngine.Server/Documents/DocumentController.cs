using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents;
using GameDocumentEngine.Server.Documents.Types;
using GameDocumentEngine.Server.Realtime;
using GameDocumentEngine.Server.Security;
using GameDocumentEngine.Server.Users;
using Json.Patch;
using Json.Schema;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Reflection.Metadata;
using System.Text.Json.Nodes;

namespace GameDocumentEngine.Server.Documents;

public class DocumentController : Api.DocumentControllerBase
{
	private readonly Documents.GameTypes allGameTypes;
	private readonly DocumentDbContext dbContext;
	private readonly JsonSchemaResolver schemaResolver;
	private readonly IPermissionedApiMapper<DocumentModel, DocumentDetails> documentMapper;

	public DocumentController(
		Documents.GameTypes allGameTypes,
		DocumentDbContext dbContext,
		JsonSchemaResolver schemaResolver,
		IPermissionedApiMapper<DocumentModel, DocumentDetails> documentMapper)
	{
		this.allGameTypes = allGameTypes;
		this.dbContext = dbContext;
		this.schemaResolver = schemaResolver;
		this.documentMapper = documentMapper;
	}

	protected override async Task<CreateDocumentActionResult> CreateDocument(Guid gameId, CreateDocumentDetails createDocumentBody)
	{
		var gameUserRecord = await (from gameUser in dbContext.GameUsers.Include(gu => gu.Game).Include(gu => gu.User)
									where gameUser.GameId == gameId && gameUser.UserId == User.GetCurrentUserId()
									select gameUser)
			.SingleOrDefaultAsync();
		if (gameUserRecord == null) return CreateDocumentActionResult.NotFound();
		// TODO: check permissions
		var gameType = allGameTypes.All.TryGetValue(gameUserRecord.Game.Type, out var result) ? result : throw new NotSupportedException($"Unknown game type: {gameUserRecord.Game.Type}");

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
				GameId = gameUserRecord.GameId,
				User = gameUserRecord.User,
				Role = docType.CreatorPermissionLevel
			} },
		};
		dbContext.Add(document);
		await dbContext.SaveChangesAsync();

		return CreateDocumentActionResult.Ok(await ToDocumentDetails(document, PermissionSet.Stub));
	}

	protected override async Task<ListDocumentsActionResult> ListDocuments(Guid gameId)
	{
		var documents = await (from gameUser in dbContext.DocumentUsers
							   where gameUser.UserId == User.GetCurrentUserId() && gameUser.GameId == gameId
							   select new DocumentSummary(gameUser.Document.Id, gameUser.Document.Name, gameUser.Document.Type)).ToArrayAsync();
		return ListDocumentsActionResult.Ok(documents.ToDictionary(d => d.Id.ToString()));
	}

	protected override async Task<DeleteDocumentActionResult> DeleteDocument(Guid gameId, Guid id)
	{
		var documentUserRecord = await (from documentUser in dbContext.DocumentUsers
										.Include(du => du.GameUser).Include(du => du.Document).ThenInclude(d => d.Players)
										where documentUser.DocumentId == id && documentUser.UserId == User.GetCurrentUserId()
										select documentUser)
			.SingleOrDefaultAsync();
		if (documentUserRecord == null) return DeleteDocumentActionResult.NotFound();
		// TODO - check permissions

		dbContext.RemoveRange(documentUserRecord.Document.Players);
		dbContext.Remove(documentUserRecord.Document);
		await dbContext.SaveChangesAsync();
		return DeleteDocumentActionResult.Ok();
	}

	protected override async Task<GetDocumentActionResult> GetDocument(Guid gameId, Guid id)
	{
		var documentUserRecord = await (from documentUser in dbContext.DocumentUsers.Include(du => du.GameUser).Include(du => du.Document)
										where documentUser.DocumentId == id && documentUser.UserId == User.GetCurrentUserId() && documentUser.GameId == gameId
										select documentUser)
			.SingleOrDefaultAsync();
		if (documentUserRecord == null) return GetDocumentActionResult.NotFound();
		// TODO: check permissions

		return GetDocumentActionResult.Ok(await ToDocumentDetails(documentUserRecord.Document, PermissionSet.Stub));
	}

	protected override async Task<PatchDocumentActionResult> PatchDocument(Guid gameId, Guid id, JsonPatch patchDocumentBody)
	{
		if (!ModelState.IsValid) return PatchDocumentActionResult.BadRequest("Unable to parse JSON Patch");

		var documentUserRecord = await (from documentUser in dbContext.DocumentUsers.Include(du => du.GameUser).ThenInclude(gu => gu.Game).Include(du => du.Document)
										where documentUser.DocumentId == id && documentUser.UserId == User.GetCurrentUserId() && documentUser.GameId == gameId
										select documentUser)
			.SingleOrDefaultAsync();
		if (documentUserRecord == null) return PatchDocumentActionResult.NotFound();

		var editable = new JsonObject(
			new[]
			{
				KeyValuePair.Create<string, JsonNode?>("name", documentUserRecord.Document.Name),
				KeyValuePair.Create<string, JsonNode?>("details", documentUserRecord.Document.Details),
			}
		);
		var result = patchDocumentBody.Apply(editable);
		if (!result.IsSuccess)
			return PatchDocumentActionResult.BadRequest(result.Error ?? "Unknown error");
		// TODO: check permissions

		documentUserRecord.Document.Name = result.Result?["name"]?.GetValue<string?>() ?? documentUserRecord.Document.Name;
		documentUserRecord.Document.Details = result.Result?["details"] ?? documentUserRecord.Document.Details;

		var gameType = allGameTypes.All.TryGetValue(documentUserRecord.GameUser.Game.Type, out var resultGameType) ? resultGameType : throw new NotSupportedException($"Unknown game type: {documentUserRecord.GameUser.Game.Type}");
		var docType = gameType.ObjectTypes.FirstOrDefault(t => t.Name == documentUserRecord.Document.Type);
		if (docType == null)
			return PatchDocumentActionResult.BadRequest("Unknown document type for game");

		var schema = await schemaResolver.GetOrLoadSchema(docType);
		var results = schema.Evaluate(documentUserRecord.Document.Details, new EvaluationOptions { OutputFormat = OutputFormat.Hierarchical });
		if (!results.IsValid)
		{
			var errors = results.Errors;
			if (errors == null)
				return PatchDocumentActionResult.BadRequest("Unable to verify request");
			return PatchDocumentActionResult.BadRequest($"Errors from schema: {string.Join('\n', errors.Select(kvp => kvp.Key + ": " + kvp.Value))}");
		}

		await dbContext.SaveChangesAsync();

		return PatchDocumentActionResult.Ok(await ToDocumentDetails(documentUserRecord.Document, PermissionSet.Stub));
	}

	private Task<DocumentDetails> ToDocumentDetails(DocumentModel document, PermissionSet permissionSet) =>
		documentMapper.ToApi(dbContext, document, permissionSet);
}

class DocumentModelApiMapper : IPermissionedApiMapper<DocumentModel, Api.DocumentDetails>
{
	public Task<DocumentDetails> ToApi(DocumentDbContext dbContext, DocumentModel document, PermissionSet permissionSet) =>
		Task.FromResult(ToApi(document, permissionSet));

	public Task<DocumentDetails> ToApiBeforeChanges(DocumentDbContext dbContext, DocumentModel entity, PermissionSet permissionSet)
	{
		return Task.FromResult(ToApi(
			dbContext.Entry(entity).OriginalValues.Clone().ToObject() as DocumentModel
				?? throw new InvalidOperationException("Could not create original"),
			permissionSet
		));
	}

	private DocumentDetails ToApi(DocumentModel document, PermissionSet permissionSet) =>
		// TODO: mask parts of document data based on permissions
		new DocumentDetails(
			GameId: document.GameId,
			Id: document.Id,
			Name: document.Name,
			Type: document.Type,
			Details: document.Details,
			LastUpdated: document.LastModifiedDate
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
			.Select(gameUser => new PermissionSet(gameUser.UserId, gameUser.ToPermissions()));

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
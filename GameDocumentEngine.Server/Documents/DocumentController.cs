using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents;
using GameDocumentEngine.Server.Documents.Types;
using GameDocumentEngine.Server.Realtime;
using GameDocumentEngine.Server.Users;
using Json.Patch;
using Json.Schema;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Text.Json.Nodes;

namespace GameDocumentEngine.Server.Documents;

public class DocumentController : Api.DocumentControllerBase
{
	private readonly Documents.GameTypes allGameTypes;
	private readonly DocumentDbContext dbContext;
	private readonly JsonSchemaResolver schemaResolver;

	public DocumentController(Documents.GameTypes allGameTypes, DocumentDbContext dbContext, JsonSchemaResolver schemaResolver)
	{
		this.allGameTypes = allGameTypes;
		this.dbContext = dbContext;
		this.schemaResolver = schemaResolver;
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
			Players = { new DocumentUserModel { GameId = gameUserRecord.GameId, User = gameUserRecord.User } },
		};
		dbContext.Add(document);
		await dbContext.SaveChangesAsync();

		return CreateDocumentActionResult.Ok(ToDocumentDetails(document));
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

		return GetDocumentActionResult.Ok(ToDocumentDetails(documentUserRecord.Document));
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

		return PatchDocumentActionResult.Ok(ToDocumentDetails(documentUserRecord.Document));
	}

	private static DocumentDetails ToDocumentDetails(DocumentModel document)
	{
		// TODO: trim document based on permissions?
		return new DocumentDetails(
					GameId: document.GameId,
					Id: document.Id,
					Name: document.Name,
					Type: document.Type,
					Details: document.Details,
					LastUpdated: document.LastModifiedDate
				);
	}
}

class DocumentModelChangeNotifications : EntityChangeNotifications<DocumentModel, Api.DocumentDetails>
{
	// TODO: mask parts of document data based on permissions

	public override bool CanHandle(EntityEntry changedEntity) => changedEntity.Entity is DocumentModel or DocumentUserModel;

	public override ValueTask SendNotification(DocumentDbContext context, IHubClients clients, EntityEntry changedEntity)
	{
		if (changedEntity.Entity is DocumentUserModel)
			return SendNotificationUserModel(context, clients, changedEntity);
		return base.SendNotification(context, clients, changedEntity);
	}

	private async ValueTask SendNotificationUserModel(DocumentDbContext context, IHubClients clients, EntityEntry changedEntity)
	{
		var target = changedEntity.Entity as DocumentUserModel;
		if (target == null)
			return;
		var players = await context.DocumentUsers.Where(du => du.DocumentId == target.DocumentId).Where(u => u.UserId != target.UserId).Select(target => target.UserId).ToArrayAsync();

		// treat removing the `target` as deleting the document, adding the 'target' as creating the document, and broadcast changes to others on the document
		var currentUser = GroupNames.UserDirect(target.UserId);
		var otherUsers = players.Select(GroupNames.UserDirect);
		var key = new { target.GameId, Id = target.DocumentId };
		if (changedEntity.State == EntityState.Deleted)
			await clients.Group(currentUser).SendAsync("DocumentDeleted", new { key });
		else if (changedEntity.State == EntityState.Added)
			await clients.Group(currentUser).SendAsync("DocumentAdded", new { key, value = await GetValue() });
		else if (changedEntity.State == EntityState.Modified)
			await clients.Group(currentUser).SendAsync("DocumentChanged", new { key, value = await GetValue() });

		await clients.Groups(otherUsers).SendAsync("DocumentUsersChanged", new { key });

		async Task<Api.DocumentDetails> GetValue() =>
			await ToApi(
				target.Document
				?? await context.Documents.FindAsync(key.Id)
				?? throw new InvalidOperationException("Could not find doc")
			);
	}

	protected override Task SendAddedMessage(Data.DocumentDbContext context, IHubClients clients, DocumentModel result, object message) =>
		Task.CompletedTask;

	protected override Task SendDeletedMessage(Data.DocumentDbContext context, IHubClients clients, DocumentModel original, object message) =>
		Task.CompletedTask;

	protected override async Task SendModifiedMessage(Data.DocumentDbContext context, IHubClients clients, DocumentModel original, object message)
	{
		var players = await context.DocumentUsers.Where(du => du.DocumentId == original.Id).ToArrayAsync();
		await clients.Groups(players.Select(p => p.UserId).Select(GroupNames.UserDirect)).SendAsync("DocumentChanged", message);
	}

	protected override Task<DocumentDetails> ToApi(DocumentModel document) => Task.FromResult(new DocumentDetails(
			GameId: document.GameId,
			Id: document.Id,
			Name: document.Name,
			Type: document.Type,
			Details: document.Details,
			LastUpdated: document.LastModifiedDate
		));

	protected override object ToKey(DocumentModel entity) => new { entity.GameId, entity.Id };
}

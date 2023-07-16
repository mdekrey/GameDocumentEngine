using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents;
using GameDocumentEngine.Server.Documents.Types;
using GameDocumentEngine.Server.Users;
using Json.Schema;
using Microsoft.EntityFrameworkCore;

namespace GameDocumentEngine.Server.Controllers;

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
									where gameUser.GameId == gameId && gameUser.User.GoogleNameId == User.GetGoogleNameIdOrThrow()
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

		// TODO: save document
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

		return CreateDocumentActionResult.Ok(new DocumentDetailsWithId(
			Id: document.Id,
			Details: createDocumentBody.Details,
			Name: document.Name,
			LastUpdated: document.LastModifiedDate
		));
	}

	protected override async Task<ListDocumentsActionResult> ListDocuments(Guid gameId)
	{
		var games = await (from gameUser in dbContext.DocumentUsers
						   where gameUser.User.GoogleNameId == User.GetGoogleNameIdOrThrow()
						   select new DocumentSummary(gameUser.Document.Id, gameUser.Document.Name, gameUser.Document.Type)).ToArrayAsync();
		return ListDocumentsActionResult.Ok(games);
	}

	protected override async Task<DeleteDocumentActionResult> DeleteDocument(Guid gameId, Guid id)
	{
		var gameUserRecord = await (from documentUser in dbContext.DocumentUsers
										.Include(du => du.GameUser).Include(du => du.Document).Include(du => du.User)
									where documentUser.DocumentId == id && documentUser.User.GoogleNameId == User.GetGoogleNameIdOrThrow()
									select documentUser)
			.SingleOrDefaultAsync();
		if (gameUserRecord == null) return DeleteDocumentActionResult.NotFound();
		// TODO - check permissions

		dbContext.Remove(gameUserRecord.Document);
		await dbContext.SaveChangesAsync();
		return DeleteDocumentActionResult.Ok();
	}

	protected override async Task<GetDocumentActionResult> GetDocument(Guid gameId, Guid id)
	{
		var documentUserRecord = await (from documentUser in dbContext.DocumentUsers.Include(du => du.GameUser).Include(du => du.Document)
										where documentUser.DocumentId == id && documentUser.User.GoogleNameId == User.GetGoogleNameIdOrThrow() && documentUser.GameId == gameId
										select documentUser)
			.SingleOrDefaultAsync();
		if (documentUserRecord == null) return GetDocumentActionResult.NotFound();
		// TODO: check permissions

		return GetDocumentActionResult.Ok(ToDocumentDetails(documentUserRecord.Document));
	}

	protected override async Task<PatchDocumentActionResult> PatchDocument(Guid gameId, Guid id, EditableDocumentDetails patchDocumentBody)
	{
		if (!ModelState.IsValid) return PatchDocumentActionResult.BadRequest("Unable to parse JSON Patch");

		var documentUserRecord = await (from documentUser in dbContext.DocumentUsers.Include(du => du.GameUser).ThenInclude(gu => gu.Game).Include(du => du.Document)
										where documentUser.DocumentId == id && documentUser.User.GoogleNameId == User.GetGoogleNameIdOrThrow() && documentUser.GameId == gameId
										select documentUser)
			.SingleOrDefaultAsync();
		if (documentUserRecord == null) return PatchDocumentActionResult.NotFound();

		var result = patchDocumentBody.Details.Apply(documentUserRecord.Document.Details);
		if (!result.IsSuccess)
			return PatchDocumentActionResult.BadRequest(result.Error ?? "Unknown error");
		// TODO: check permissions

		documentUserRecord.Document.Details = result.Result ?? documentUserRecord.Document.Details;

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
					Name: document.Name,
					Details: document.Details,
					LastUpdated: document.LastModifiedDate
				);
	}
}

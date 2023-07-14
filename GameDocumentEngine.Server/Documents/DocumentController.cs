using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents.Types;
using GameDocumentEngine.Server.Users;
using Json.Patch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;
using System.Text.Json.Nodes;

namespace GameDocumentEngine.Server.Controllers;

public class DocumentController : Api.DocumentControllerBase
{
	// TODO: remove this temp storage
	public static ConcurrentDictionary<string, JsonNode> tempStorage = new ConcurrentDictionary<string, JsonNode>();
	private readonly Documents.GameTypes allGameTypes;
	private readonly DocumentDbContext dbContext;
	private readonly JsonSchemaResolver schemaResolver;

	public DocumentController(Documents.GameTypes allGameTypes, DocumentDbContext dbContext, JsonSchemaResolver schemaResolver)
	{
		this.allGameTypes = allGameTypes;
		this.dbContext = dbContext;
		this.schemaResolver = schemaResolver;
	}

	protected override async Task<GetDocumentActionResult> GetDocument(Guid gameId, string typeId, string id)
	{
		await Task.Yield();
		if (!tempStorage.TryGetValue(id, out var node))
			return GetDocumentActionResult.NotFound();
		return GetDocumentActionResult.Ok(node);
	}

	protected override async Task<UpdateDocumentActionResult> UpdateDocument(Guid gameId, string typeId, string id, JsonNode node)
	{
		if (!ModelState.IsValid) return UpdateDocumentActionResult.BadRequest("Invalid JSON");
		await Task.Yield();
		tempStorage.AddOrUpdate(id, node, (_, _) => node);
		return UpdateDocumentActionResult.Ok();
	}

	protected override async Task<PatchDocumentActionResult> PatchDocument(Guid gameId, string typeId, string id, JsonPatch patch)
	{
		if (!ModelState.IsValid) return PatchDocumentActionResult.BadRequest("Unable to parse JSON Patch");
		await Task.Yield();
		if (!tempStorage.TryGetValue(id, out var node)) return PatchDocumentActionResult.NotFound();
		var result = patch.Apply(node);
		if (!result.IsSuccess)
			return PatchDocumentActionResult.BadRequest(result.Error ?? "Unknown error");
		// TODO - validate against the schema
		if (!tempStorage.TryUpdate(id, result.Result!, node))
			return PatchDocumentActionResult.Conflict();
		return PatchDocumentActionResult.Ok(result.Result!);
	}

	protected override async Task<CreateDocumentActionResult> CreateDocument(Guid gameId, string typeId, JsonNode createDocumentBody)
	{
		var gameUserRecord = await (from gameUser in dbContext.GameUsers.Include(gu => gu.Game)
									where gameUser.GameId == gameId && gameUser.User.GoogleNameId == User.GetGoogleNameIdOrThrow()
									select gameUser)
			.SingleOrDefaultAsync();
		if (gameUserRecord == null) return CreateDocumentActionResult.NotFound();
		// TODO: check permissions
		var gameType = allGameTypes.All.TryGetValue(gameUserRecord.Game.Type, out var result) ? result : throw new NotSupportedException($"Unknown game type: {gameUserRecord.Game.Type}");

		var docType = gameType.ObjectTypes.FirstOrDefault(t => t.Name == typeId);
		if (docType == null)
			return CreateDocumentActionResult.BadRequest("Unknown document type for game");

		var schema = await schemaResolver.GetOrLoadSchema(docType);
		// TODO: validate body against schema
		return CreateDocumentActionResult.Ok();
	}
}

using Json.Patch;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;
using System.Text.Json.Nodes;

namespace GameDocumentEngine.Server.Controllers;

public class DocumentController : Api.DocumentControllerBase
{
	public static ConcurrentDictionary<string, JsonNode> tempStorage = new ConcurrentDictionary<string, JsonNode>();

	protected override async Task<GetDocumentActionResult> GetDocument(string id)
	{
		await Task.Yield();
		if (!tempStorage.TryGetValue(id, out var node))
			return GetDocumentActionResult.NotFound();
		return GetDocumentActionResult.Ok(node);
	}

	protected override async Task<PutDocumentActionResult> PutDocument(string id, JsonNode node)
	{
		if (!ModelState.IsValid) return PutDocumentActionResult.BadRequest("Invalid JSON");
		await Task.Yield();
		tempStorage.AddOrUpdate(id, node, (_, _) => node);
		return PutDocumentActionResult.Ok();
	}

	protected override async Task<PatchDocumentActionResult> PatchDocument(string id, JsonPatch patch)
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
}

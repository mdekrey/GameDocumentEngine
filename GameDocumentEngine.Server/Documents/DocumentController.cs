using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents.Types;
using GameDocumentEngine.Server.Json;
using GameDocumentEngine.Server.Realtime;
using GameDocumentEngine.Server.Security;
using GameDocumentEngine.Server.Tracing;
using GameDocumentEngine.Server.Users;
using Google.Protobuf.WellKnownTypes;
using Json.More;
using Json.Patch;
using Json.Path;
using Json.Schema;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Nodes;
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

		var document = new DocumentModel
		{
			Game = game,
			GameId = gameId,
			Details = createDocumentBody.Details,
			Name = createDocumentBody.Name,
			Type = createDocumentBody.Type,
		};

		var docType = GetDocumentType(document);
		if (docType == null)
			return CreateDocumentActionResult.BadRequest("Unknown document type for game");

		document.Players.Add(new DocumentUserModel
		{
			GameId = game.Id,
			UserId = User.GetUserIdOrThrow(),
			Role = docType.CreatorPermissionLevel
		});

		var schema = await schemaResolver.GetOrLoadSchema(docType);
		var results = schema.Evaluate(createDocumentBody.Details, new EvaluationOptions { OutputFormat = OutputFormat.Hierarchical });
		if (!results.IsValid)
		{
			var errors = results.Errors;
			if (errors == null)
				return CreateDocumentActionResult.BadRequest("Unable to verify request");
			return CreateDocumentActionResult.BadRequest($"Errors from schema: {string.Join('\n', errors.Select(kvp => kvp.Key + ": " + kvp.Value))}");
		}

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

		var document = permissions.GameUser.Documents.FirstOrDefault(du => du.DocumentId == id)?.Document
			?? await (from doc in dbContext.Documents
					  where doc.Id == id
					  select doc).SingleOrDefaultAsync();
		if (document == null) return GetDocumentActionResult.NotFound();

		return GetDocumentActionResult.Ok(await ToDocumentDetails(document, permissions));
	}

	protected override async Task<PatchDocumentActionResult> PatchDocument(Guid gameId, Guid id, JsonPatch patchDocumentBody)
	{
		if (!ModelState.IsValid) return PatchDocumentActionResult.BadRequest("Unable to parse JSON Patch");
		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId, id);
		if (permissions?.HasPermission(SeeDocument(gameId, id)) is not true) return PatchDocumentActionResult.NotFound();

		var document = await dbContext.Documents.Include(doc => doc.Game).FirstAsync(doc => doc.Id == id);
		// check permissions with patch to see if allowed
		var jsonPaths = permissions.Permissions.MatchingPermissionsParams(WriteDocumentDetailsPrefix(gameId, id));
		if (!patchDocumentBody.HasOnlyAllowedPaths(EditableDocumentModel.Create(document), jsonPaths))
			return PatchDocumentActionResult.Forbidden();

		var docType = GetDocumentType(document);
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

	private IGameObjectType? GetDocumentType(DocumentModel document)
	{
		var gameType = allGameTypes.All[document.Game.Type];
		return gameType.ObjectTypes.FirstOrDefault(t => t.Key == document.Type);
	}

	protected override async Task<UpdateDocumentRoleAssignmentsActionResult> UpdateDocumentRoleAssignments(Guid gameId, Guid id, Dictionary<string, string?> updateDocumentRoleAssignmentsBody)
	{
		var permissions = await permissionSetResolver.GetPermissionSet(User, gameId, id);
		if (permissions == null) return UpdateDocumentRoleAssignmentsActionResult.NotFound();
		if (!permissions.HasPermission(UpdateDocumentUserAccess(gameId, id))) return UpdateDocumentRoleAssignmentsActionResult.Forbidden();

		var document = permissions.GameUser.Documents.FirstOrDefault(du => du.DocumentId == id)?.Document
			?? await dbContext.Documents.Include(d => d.Game).Include(d => d.Players).Where(d => d.Id == id && d.GameId == gameId).SingleAsync();

		var docType = GetDocumentType(document);
		if (docType == null)
			return UpdateDocumentRoleAssignmentsActionResult.BadRequest();

		var gameUserRecords = document.Players
			?? await (from documentUser in dbContext.DocumentUsers
					  where documentUser.GameId == gameId && documentUser.DocumentId == id
					  select documentUser).ToListAsync();
		foreach (var kvp in updateDocumentRoleAssignmentsBody)
		{
			var key = Guid.Parse(kvp.Key);
			if (key == permissions.GameUser.UserId)
				// Can't update your own permissions!
				return UpdateDocumentRoleAssignmentsActionResult.Forbidden();
			var modifiedUser = gameUserRecords.FirstOrDefault(u => u.UserId == key);
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
				modifiedUser = new DocumentUserModel { UserId = key, GameId = gameId, DocumentId = id, Role = kvp.Value };
				dbContext.DocumentUsers.Add(modifiedUser);
				gameUserRecords.Add(modifiedUser);
			}
			else modifiedUser.Role = kvp.Value;
		}
		await dbContext.SaveChangesAsync();
		return UpdateDocumentRoleAssignmentsActionResult.Ok(
			gameUserRecords.ToDictionary(gu => gu.UserId.ToString(), gu => gu.Role)
		);
	}

	private Task<DocumentDetails> ToDocumentDetails(DocumentModel document, PermissionSet permissionSet) =>
		documentMapper.ToApi(dbContext, document, permissionSet, DbContextChangeUsage.AfterChange);
}

class DocumentModelApiMapper : IPermissionedApiMapper<DocumentModel, Api.DocumentDetails>
{
	public async Task<DocumentDetails> ToApi(DocumentDbContext dbContext, DocumentModel entity, PermissionSet permissionSet, DbContextChangeUsage usage)
	{
		using var activity = TracingHelper.StartActivity($"{nameof(DocumentModelApiMapper)}.{nameof(ToApi)}");
		var resultGame = dbContext.Entry(entity).AtState(usage);

		var documentUsersCollection = dbContext
			.Entry(entity)
			.Collection(game => game.Players);
		await documentUsersCollection.Query().LoadAsync();

		// mask parts of document data based on permissions
		var jsonPaths = permissionSet.Permissions
			.MatchingPermissionsParams(ReadDocumentDetailsPrefix(entity.GameId, entity.Id))
			.Append("$.details")
			.ToArray();

		var filtered = JsonSerializer.SerializeToNode(new { details = resultGame.Details })
				?.FilterNode(jsonPaths)["details"]
				?? throw new InvalidDataException("Json path excluded details object");

		return new DocumentDetails(
			GameId: resultGame.GameId,
			Id: resultGame.Id,
			Name: resultGame.Name,
			Type: resultGame.Type,
			Details: filtered,
			Permissions: documentUsersCollection
				.Entries(dbContext)
				.AtState(usage)
				.ToDictionary(
					p => p.UserId.ToString(),
					p => p.Role
				)
		);
	}

	public object ToKey(DocumentModel entity) => new { entity.GameId, entity.Id };
}

class DocumentModelChangeNotifications : PermissionedEntityChangeNotifications<DocumentModel, DocumentUserModel, Api.DocumentDetails>
{
	private readonly GamePermissionSetResolverFactory permissionSetResolverFactory;

	public DocumentModelChangeNotifications(
		IPermissionedApiMapper<DocumentModel, DocumentDetails> apiMapper,
		IApiChangeNotification<DocumentDetails> changeNotification,
		GamePermissionSetResolverFactory permissionSetResolverFactory)
		: base(apiMapper, changeNotification, du => du.UserId, du => du.Document)
	{
		this.permissionSetResolverFactory = permissionSetResolverFactory;
	}

	protected override async Task<IEnumerable<PermissionSet>> GetUsersFor(DocumentDbContext context, DocumentModel entity, DbContextChangeUsage changeState)
	{
		using var activity = TracingHelper.StartActivity($"{nameof(DocumentModelChangeNotifications)}.{nameof(GetUsersFor)}");
		var documentUserEntries = await context.LoadEntityEntriesAsync<DocumentUserModel>(du => du.GameId == entity.GameId && du.DocumentId == entity.Id);
		var gameUserEntries = await context.LoadEntityEntriesAsync<GameUserModel>(g => g.GameId == entity.GameId);

		var documentUsers = documentUserEntries.AtState(changeState);
		var gameUsers = gameUserEntries.AtState(changeState);

		var byUser = (from gameUser in gameUsers
					  let documentUser = documentUsers.FirstOrDefault(du => du.UserId == gameUser.UserId)
					  // Document User may not have existed for every user, such as when creating or destroying
					  where documentUser != null
					  select new
					  {
						  gameUser,
						  documentUser
					  }).ToArray();

		var permissionSetResolver = permissionSetResolverFactory.Create(context);
		var permissions = await byUser
			.WhenAll(user => permissionSetResolver.GetPermissions(user.gameUser, (entity, user.documentUser)))
			.Where(ps => ps != null)
			.Select(ps => ps!)
			.ToArrayAsync();

		return permissions;
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
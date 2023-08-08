using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Realtime;
using Microsoft.AspNetCore.SignalR;

namespace GameDocumentEngine.Server.Documents;

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
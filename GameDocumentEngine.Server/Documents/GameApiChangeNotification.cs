using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Realtime;
using Microsoft.AspNetCore.SignalR;

namespace GameDocumentEngine.Server.Documents;

class GameApiChangeNotification : IApiChangeNotification<Api.GameDetails>
{
	private readonly IHubContext<GameDocumentsHub> hubContext;

	public GameApiChangeNotification(IHubContext<GameDocumentsHub> hubContext)
	{
		this.hubContext = hubContext;
	}

	public async Task SendAddedNotification(object apiKey, GameDetails newApiObject, Guid userId) =>
		await hubContext.User(userId).SendValue("Game", apiKey, newApiObject);

	public async Task SendDeletedNotification(object apiKey, Guid userId) =>
		await hubContext.User(userId).SendDeleted("Game", apiKey);

	public async Task SendModifiedNotification(object apiKey, GameDetails oldApiObject, GameDetails newApiObject, Guid userId)
	{
		await hubContext.User(userId).SendWithPatch("Game", apiKey, oldApiObject, newApiObject);
	}
}
using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Realtime;
using Microsoft.AspNetCore.SignalR;

namespace GameDocumentEngine.Server.Users;

class UserApiChangeNotification : IApiChangeNotification<UserDetails>
{
	private readonly IHubContext<GameDocumentsHub> hubContext;

	public UserApiChangeNotification(IHubContext<GameDocumentsHub> hubContext)
	{
		this.hubContext = hubContext;
	}

	public Task SendAddedNotification(object apiKey, UserDetails newApiObject, Guid userId) => Task.CompletedTask;

	public Task SendDeletedNotification(object apiKey, Guid userId) => Task.CompletedTask;

	public async Task SendModifiedNotification(object apiKey, UserDetails oldApiObject, UserDetails newApiObject, Guid userId)
	{
		await hubContext.User(userId).SendWithPatch("User", apiKey, oldApiObject, newApiObject);
	}
}

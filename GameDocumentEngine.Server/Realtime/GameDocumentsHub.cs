using GameDocumentEngine.Server.Users;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Runtime.CompilerServices;
using System.Security.Claims;

namespace GameDocumentEngine.Server.Realtime;


[Microsoft.AspNetCore.Authorization.Authorize(Policy = "AuthenticatedUser")]
public class GameDocumentsHub : Hub
{
	private readonly IServiceScopeFactory scopeFactory;

	public GameDocumentsHub(IServiceScopeFactory scopeFactory)
	{
		this.scopeFactory = scopeFactory;
	}

	public override async Task OnConnectedAsync()
	{
		if (Context.User?.GetCurrentUserId() is not Guid userId)
		{
			Context.Abort();
			return;
		}

		await Groups.AddToGroupAsync(Context.ConnectionId, GroupNames.User(userId));
	}

	public async Task InitializeUser()
	{
		if (Context.User?.GetCurrentUserId() is not Guid userId)
		{
			Context.Abort();
			return;
		}

		await Groups.AddToGroupAsync(Context.ConnectionId, GroupNames.User(userId));
	}
}

public static class MessageFactories
{
	public static Task SendUserUpdated(this IHubClients clients, Guid messageId, Guid userId) =>
		clients.Group(GroupNames.User(userId)).SendAsync("UserUpdated", new { userId, messageId });
}

public static class GroupNames
{

	// groups basically match UI cache keys
	// user
	public static string User(Guid userId) => $"user:{userId}";
	// game
	public static string Game(Guid gameId) => $"game:{gameId}";
	// document
	public static string Document(Guid gameId, Guid documentId, string filterLevel) => $"game:{gameId}:document:{documentId}:{filterLevel}";

}
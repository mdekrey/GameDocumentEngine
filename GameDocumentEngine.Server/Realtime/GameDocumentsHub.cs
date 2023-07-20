using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Users;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Runtime.CompilerServices;
using System.Security.Claims;
using System.Xml.Linq;

namespace GameDocumentEngine.Server.Realtime;


[Microsoft.AspNetCore.Authorization.Authorize(Policy = "AuthenticatedUser")]
public class GameDocumentsHub : Hub
{
	private readonly IServiceScopeFactory scopeFactory;
	private readonly Documents.GameTypes gameTypes;

	public GameDocumentsHub(IServiceScopeFactory scopeFactory, Documents.GameTypes gameTypes)
	{
		this.scopeFactory = scopeFactory;
		this.gameTypes = gameTypes;
	}

	public override async Task OnConnectedAsync()
	{
		if (Context.User?.GetCurrentUserId() is not Guid userId)
		{
			Context.Abort();
			return;
		}

		await Groups.AddToGroupAsync(Context.ConnectionId, GroupNames.UserDirect(userId));
		await Groups.AddToGroupAsync(Context.ConnectionId, GroupNames.User(userId));
	}
}

public static class GroupNames
{
	// Sends messages directly to the user in question
	public static string UserDirect(Guid userId) => $"user:{userId}:direct";

	// groups basically match UI cache keys
	// user
	public static string User(Guid userId) => $"user:{userId}";

}
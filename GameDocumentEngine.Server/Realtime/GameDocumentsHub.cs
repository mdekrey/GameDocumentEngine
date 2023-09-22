using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Users;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Runtime.CompilerServices;
using System.Security.Claims;
using System.Xml.Linq;

namespace GameDocumentEngine.Server.Realtime;


[Microsoft.AspNetCore.Authorization.Authorize(Policy = "AuthenticatedUser")]
public class GameDocumentsHub : Hub
{
	private readonly IServiceScopeFactory scopeFactory;
	private readonly Documents.GameTypes gameTypes;
	private readonly BuildOptions buildOptions;

	public GameDocumentsHub(IServiceScopeFactory scopeFactory, Documents.GameTypes gameTypes, IOptions<BuildOptions> buildOptions)
	{
		this.scopeFactory = scopeFactory;
		this.gameTypes = gameTypes;
		this.buildOptions = buildOptions.Value;
	}

	public override async Task OnConnectedAsync()
	{
		if (Context.User?.GetCurrentUserId() is not Guid userId)
		{
			// Shouldn't happen due to Authorize policy above
			Context.Abort();
			return;
		}

		await Clients.Caller.SendAsync("User", userId);
		await Clients.Caller.SendAsync("GitHash", buildOptions.GitHash);

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
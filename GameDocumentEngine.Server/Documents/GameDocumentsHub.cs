using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GameDocumentEngine.Server.Documents;

public class GameDocumentsHub : Hub
{
	private readonly IServiceScopeFactory scopeFactory;

	// groups basically match UI cache keys
	// user
	private static string UserGroupName(Guid userId) => $"user:{userId}";
	// game
	private static string GameGroupName(Guid gameId) => $"game:{gameId}";
	// document
	private static string DocumentGroupName(Guid gameId, Guid documentId, string filterLevel) => $"game:{gameId}:document:{documentId}:{filterLevel}";

	public GameDocumentsHub(IServiceScopeFactory scopeFactory)
	{
		this.scopeFactory = scopeFactory;
	}

	public async Task InitializeUser()
	{
		var nameIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier);
		if (nameIdClaim == null)
		{
			Context.Abort();
			return;
		}
		using var scope = scopeFactory.CreateScope();
		var dbContext = scope.ServiceProvider.GetRequiredService<Data.DocumentDbContext>();
		var user = await dbContext.Users.SingleOrDefaultAsync(u => u.GoogleNameId == nameIdClaim.Value);
		if (user == null)
		{
			Context.Abort();
			return;
		}

		await Groups.AddToGroupAsync(Context.ConnectionId, UserGroupName(user.Id));
	}

}

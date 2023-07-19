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

	public record SubscribeGameParams(Guid GameId);
	public record SubscribeDocumentParams(Guid GameId, Guid Id);

	public async Task SubscribeToGame(SubscribeGameParams args)
	{
		if (Context.User?.GetCurrentUserId() is not Guid userId)
		{
			Context.Abort();
			return;
		}

		using var scope = scopeFactory.CreateScope();
		var db = scope.ServiceProvider.GetRequiredService<DocumentDbContext>();
		var gameUser = await db.GameUsers.Include(gu => gu.Documents).Include(gu => gu.Game).SingleOrDefaultAsync(gu => gu.GameId == args.GameId && gu.UserId == gu.UserId);
		if (gameUser == null) return;
		var gameType = gameTypes.All[gameUser.Game.Type];
		var documentTypes = gameType.ObjectTypes.ToDictionary(docType => docType.Name);

		await Groups.AddToGroupAsync(Context.ConnectionId, GroupNames.Game(args.GameId));
		await Task.WhenAll(
			gameUser.Documents.Select(doc =>
			{
				//documentTypes[]
				return Groups.AddToGroupAsync(Context.ConnectionId, GroupNames.Document(args.GameId, doc.DocumentId /* TODO: filter level */));
			})
		);
	}

	public async Task RefreshDocumentSubscription(SubscribeDocumentParams args)
	{
		if (Context.User?.GetCurrentUserId() is not Guid userId)
		{
			Context.Abort();
			return;
		}

		using var scope = scopeFactory.CreateScope();
		var db = scope.ServiceProvider.GetRequiredService<DocumentDbContext>();
		var documentUser = await db.DocumentUsers.Include(du => du.Document).Include(du => du.GameUser).ThenInclude(gu => gu.Game)
			.SingleOrDefaultAsync(gu => gu.DocumentId == args.Id && gu.GameId == args.GameId && gu.UserId == gu.UserId);
		if (documentUser == null) return;
		var gameType = gameTypes.All[documentUser.GameUser.Game.Type];
		var documentType = gameType.ObjectTypes.First(docType => docType.Name == documentUser.Document.Type);

		await Task.WhenAll(
			documentType.PermissionLevels.Select(level =>
			{
				return level == documentType.CreatorPermissionLevel
					? Groups.AddToGroupAsync(Context.ConnectionId, GroupNames.Document(args.GameId, documentUser.DocumentId, filterLevel: level))
					: Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupNames.Document(args.GameId, documentUser.DocumentId, filterLevel: level));
			})
		);
	}

	public async Task UnsubscribeFromGame(SubscribeGameParams args)
	{
		if (Context.User?.GetCurrentUserId() is not Guid userId)
		{
			Context.Abort();
			return;
		}

		await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupNames.Game(args.GameId));
		using var scope = scopeFactory.CreateScope();
		var db = scope.ServiceProvider.GetRequiredService<DocumentDbContext>();
		var game = await db.Games.Include(g => g.Documents).SingleOrDefaultAsync(g => g.Id == args.GameId);
		if (game == null) return;
		var gameType = gameTypes.All[game.Type];
		var documentTypes = gameType.ObjectTypes.ToDictionary(docType => docType.Name);

		await Task.WhenAll(
			from doc in game.Documents
			from level in documentTypes[doc.Type].PermissionLevels
			select Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupNames.Document(args.GameId, doc.Id, filterLevel: level))
		);
	}
}

public static class GroupNames
{
	// Sends messages directly to the user in question
	public static string UserDirect(Guid userId) => $"user:{userId}:direct";

	// groups basically match UI cache keys
	// user
	public static string User(Guid userId) => $"user:{userId}";
	// game
	public static string Game(Guid gameId) => $"game:{gameId}";
	// document
	public static string Document(Guid gameId, Guid documentId, string filterLevel = "owner") => $"game:{gameId}:document:{documentId}:{filterLevel}";

}
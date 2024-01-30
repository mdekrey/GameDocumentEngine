using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents;
using GameDocumentEngine.Server.Users;
using Microsoft.EntityFrameworkCore;
using System.Security.AccessControl;

namespace GameDocumentEngine.Server.Security;

public class InvitationController : Api.InvitationsControllerBase
{
	private readonly Documents.GameTypes gameTypes;
	private readonly DocumentDbContext dbContext;

	public InvitationController(Documents.GameTypes gameTypes, Data.DocumentDbContext dbContext)
	{
		this.gameTypes = gameTypes;
		this.dbContext = dbContext;
	}

	protected override async Task<ListInvitationsActionResult> ListInvitations(Identifier gameId)
	{
		var gameUserRecord = await (from gameUser in dbContext.GameUsers.Include(gu => gu.Game)
									where gameUser.GameId == gameId.Value && gameUser.UserId == User.GetCurrentUserId()
									select gameUser).SingleOrDefaultAsync();
		if (gameUserRecord == null) return ListInvitationsActionResult.NotFound();
		if (!gameTypes.All.TryGetValue(gameUserRecord.Game.Type, out var gameType))
			throw new InvalidOperationException($"Unknown game type: {gameUserRecord.Game.Type}");

		if (!gameType.ToPermissionSet(gameUserRecord).HasPermission(GameSecurity.ListInvitations(gameId.Value)))
			return ListInvitationsActionResult.Forbidden();

		var invites = await dbContext.Invites.Where(i => i.GameId == gameId.Value).ToArrayAsync();

		return ListInvitationsActionResult.Ok(invites.ToDictionary(i => i.InviteId, ToApi));
	}

	protected override async Task<CreateInvitationActionResult> CreateInvitation(Identifier gameId, CreateInvitationRequest createInvitationBody)
	{
		if ((createInvitationBody.Uses != -1 && createInvitationBody.Uses <= 0))
			return CreateInvitationActionResult.BadRequest();
		var gameUserRecord = await (from gameUser in dbContext.GameUsers.Include(gu => gu.Game)
									where gameUser.GameId == gameId.Value && gameUser.UserId == User.GetCurrentUserId()
									select gameUser).SingleOrDefaultAsync();
		if (gameUserRecord == null) return CreateInvitationActionResult.NotFound();
		if (!gameTypes.All.TryGetValue(gameUserRecord.Game.Type, out var gameType))
			throw new InvalidOperationException($"Unknown game type: {gameUserRecord.Game.Type}");
		if (!gameType.Roles.Contains(createInvitationBody.Role))
			return CreateInvitationActionResult.BadRequest();
		if (!gameType.ToPermissionSet(gameUserRecord).HasPermission(GameSecurity.CreateInvitation(gameId.Value, createInvitationBody.Role)))
			return CreateInvitationActionResult.Forbidden();

		var inviteId = string.Join(string.Empty,
			Enumerable.Range(48, 75)
				// TODO: this could randomly generate bad words
				.Where(i => i < 58 || i > 64 && i < 91 || i > 96)
				.OrderBy(o => new Random().Next())
				.Take(5)
				.Select(c => (char)c)
		);

		var invite = new GameInviteModel
		{
			InviteId = inviteId,
			GameId = gameId.Value,
			GameRole = createInvitationBody.Role,
			UsesRemaining = createInvitationBody.Uses,
			Expiration = DateTimeOffset.UtcNow.AddDays(30),
		};
		dbContext.Add(invite);
		await dbContext.SaveChangesAsync();

		return CreateInvitationActionResult.Ok(ToApi(invite));
	}

	protected override async Task<CancelInvitationActionResult> CancelInvitation(string linkId)
	{
		var invite = await dbContext.Invites.Where(i => i.InviteId == linkId).FirstOrDefaultAsync();
		if (invite == null) return CancelInvitationActionResult.NotFound();

		var gameId = invite.GameId;
		var userId = User.GetCurrentUserId();
		if (userId == null) return CancelInvitationActionResult.Unauthorized();
		var gameUserRecord = await (from gameUser in dbContext.GameUsers.Include(gu => gu.Game)
									where gameUser.GameId == gameId && gameUser.UserId == userId
									select gameUser).SingleOrDefaultAsync();
		if (gameUserRecord == null) return CancelInvitationActionResult.NotFound();
		if (!gameTypes.All.TryGetValue(gameUserRecord.Game.Type, out var gameType))
			throw new InvalidOperationException($"Unknown game type: {gameUserRecord.Game.Type}");
		if (!gameType.ToPermissionSet(gameUserRecord).HasPermission(GameSecurity.CancelInvitation(gameId)))
			return CancelInvitationActionResult.Forbidden();

		dbContext.Invites.Remove(invite);
		await dbContext.SaveChangesAsync();
		return CancelInvitationActionResult.NoContent();
	}

	protected override async Task<ClaimInvitationActionResult> ClaimInvitation(string linkId)
	{
		var invite = await dbContext.Invites.Where(i => i.InviteId == linkId).FirstOrDefaultAsync();
		if (invite == null)
			return ClaimInvitationActionResult.NotFound();

		var gameId = invite.GameId;
		var userId = User.GetCurrentUserId();
		if (userId == null) return ClaimInvitationActionResult.Unauthorized();
		var gameUserRecord = await (from gameUser in dbContext.GameUsers
									where gameUser.GameId == gameId && gameUser.UserId == userId
									select gameUser).SingleOrDefaultAsync();
		if (gameUserRecord != null) return ClaimInvitationActionResult.Redirect($"/#/game/{Identifier.ToString(gameId)}?invite=repeat");
		if (invite == null) return ClaimInvitationActionResult.NotFound();

		if (invite.Expiration < DateTimeOffset.Now)
		{
			dbContext.Invites.Remove(invite);
			await dbContext.SaveChangesAsync();
			return ClaimInvitationActionResult.NotFound();
		}

		if (invite.UsesRemaining > 0)
			invite.UsesRemaining--;
		if (invite.UsesRemaining == 0)
			dbContext.Invites.Remove(invite);
		dbContext.GameUsers.Add(new GameUserModel
		{
			GameId = gameId,
			UserId = userId.Value,
			Role = invite.GameRole,
		});
		await dbContext.SaveChangesAsync();

		return ClaimInvitationActionResult.Redirect($"/#/game/{Identifier.ToString(gameId)}?invite=true");
	}

	private static GameInvite ToApi(GameInviteModel invite)
	{
		return new GameInvite(
			Id: invite.InviteId,
			GameId: (Identifier)invite.GameId,
			Role: invite.GameRole,
			UsesRemaining: invite.UsesRemaining,
			Expiration: invite.Expiration
		);
	}
}

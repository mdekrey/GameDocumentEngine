using GameDocumentEngine.Server.Security;
using System.Collections.Immutable;

namespace GameDocumentEngine.Server.Documents;

public static class GameSecurity
{
	public static string AnyGamePermission(Guid gameId) => $"game:{gameId}:**";
	public static string DeleteGame(Guid gameId) => $"game:{gameId}:delete";
	public static string UpdateGame(Guid gameId) => $"game:{gameId}:update";
	public static string CreateDocument(Guid gameId) => $"game:{gameId}:documents:create";
	public static string ListInvitations(Guid gameId) => $"game:{gameId}:invitations:list";
	public static string CreateInvitation(Guid gameId, string role) => $"game:{gameId}:invitations:create:role-{role}";
	public static string CancelInvitation(Guid gameId) => $"game:{gameId}:invitations:cancel";

	public static readonly ImmutableArray<string> GameRoles = new[]
	{
		"gm",
		"asst-gm",
		"trusted",
		"player"
	}.ToImmutableArray();

	public static readonly string DefaultGameRole = "gm";

	public static PermissionList ToPermissions(this GameUserModel gameUser)
	{
		switch (gameUser.Role)
		{
			case "gm":
				return PermissionList.From(AnyGamePermission(gameUser.GameId));
			case "asst-gm":
				return PermissionList.From(
					UpdateGame(gameUser.GameId),
					CreateDocument(gameUser.GameId),
					ListInvitations(gameUser.GameId),
					CreateInvitation(gameUser.GameId, "asst-gm"),
					CreateInvitation(gameUser.GameId, "trusted"),
					CreateInvitation(gameUser.GameId, "player"),
					CancelInvitation(gameUser.GameId)
				);
			case "trusted":
				return PermissionList.From(CreateDocument(gameUser.GameId));

			default:
			case "player":
				return PermissionList.Empty;
		}
	}
}

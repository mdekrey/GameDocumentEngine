using GameDocumentEngine.Server.Security;
using System.Collections.Immutable;

namespace GameDocumentEngine.Server.Documents;

public static class GameSecurity
{
	public static string AnyBasicGamePermission(Guid gameId) => $"game:{gameId}:*";
	public static string ViewGame(Guid gameId) => $"game:{gameId}:read";
	public static string DeleteGame(Guid gameId) => $"game:{gameId}:delete";
	public static string UpdateGame(Guid gameId) => $"game:{gameId}:update";
	public static string CreateDocument(Guid gameId) => $"game:{gameId}:create-document";
	public static string UpdateGameUserAccess(Guid gameId) => $"game:{gameId}:change-permissions";
	public static string ListInvitations(Guid gameId) => $"game:{gameId}:invitations:list";
	public static string AnyInvitationPermission(Guid gameId) => $"game:{gameId}:invitations:**";
	public static string CreateAnyInvitation(Guid gameId, string role) => $"game:{gameId}:invitations:create:*";
	public static string CreateInvitation(Guid gameId, string role) => $"game:{gameId}:invitations:create:role-{role}";
	public static string CancelInvitation(Guid gameId) => $"game:{gameId}:invitations:cancel";
	public static string SeeAnyDocument(Guid gameId) => $"game:{gameId}:document:*:view";
	public static string DeleteAnyDocument(Guid gameId) => $"game:{gameId}:document:*:delete";
	public static string BaseDocument(Guid gameId, Guid documentId) => $"game:{gameId}:document:{documentId}";
	public static string DeleteDocument(Guid gameId, Guid documentId) => $"{BaseDocument(gameId, documentId)}:delete";
	public static string UpdateAnyDocumentUserAccess(Guid gameId) => $"game:{gameId}:document:*:change-permissions";
	public static string UpdateDocumentUserAccess(Guid gameId, Guid documentId) => $"game:{gameId}:document:{documentId}:change-permissions";

	/// <summary>
	/// Allows knowledge of the document's existence
	/// </summary>
	public static string SeeDocument(Guid gameId, Guid documentId) => $"{BaseDocument(gameId, documentId)}:view";

	public static string ViewDocumentDetails(Guid gameId, Guid documentId, string jsonPath = "$") =>
		$"{ViewDocumentDetailsPrefix(gameId, documentId)}#{(jsonPath.StartsWith("$") ? jsonPath : ("$" + jsonPath))}";

	internal static string ViewDocumentDetailsPrefix(Guid gameId, Guid documentId) =>
		$"{BaseDocument(gameId, documentId)}:details";

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
				return PermissionList.From(
					AnyBasicGamePermission(gameUser.GameId),
					AnyInvitationPermission(gameUser.GameId),
					SeeAnyDocument(gameUser.GameId),
					DeleteAnyDocument(gameUser.GameId),
					UpdateAnyDocumentUserAccess(gameUser.GameId)
				);
			case "asst-gm":
				return PermissionList.From(
					ViewGame(gameUser.GameId),
					UpdateGame(gameUser.GameId),
					CreateDocument(gameUser.GameId),
					ListInvitations(gameUser.GameId),
					CreateInvitation(gameUser.GameId, "asst-gm"),
					CreateInvitation(gameUser.GameId, "trusted"),
					CreateInvitation(gameUser.GameId, "player"),
					CancelInvitation(gameUser.GameId)
				);
			case "trusted":
				return PermissionList.From(
					ViewGame(gameUser.GameId),
					CreateDocument(gameUser.GameId)
				);

			default:
			case "player":
				return PermissionList.From(
					ViewGame(gameUser.GameId)
				);
		}
	}

	public static PermissionSet ToPermissionSet(this GameUserModel gameUser) =>
		new PermissionSet(gameUser.UserId, gameUser.ToPermissions());

}

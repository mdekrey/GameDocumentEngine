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
	public static string UpdateAnyDocumentOwnAccess(Guid gameId) => $"game:{gameId}:document:*:change-my-permissions";
	public static string UpdateDocumentUserAccess(Guid gameId, Guid documentId) => $"{BaseDocument(gameId, documentId)}:change-permissions";
	public static string UpdateDocumentAccessForSelf(Guid gameId, Guid documentId) => $"{BaseDocument(gameId, documentId)}:change-my-permissions";

	/// <summary>
	/// Allows knowledge of the document's existence
	/// </summary>
	public static string SeeDocument(Guid gameId, Guid documentId) => $"{BaseDocument(gameId, documentId)}:view";

	public static string ReadDocumentDetails(Guid gameId, Guid documentId, string jsonPath = "$") =>
		$"{ReadDocumentDetailsPrefix(gameId, documentId)}#{(jsonPath.StartsWith("$") ? jsonPath : ("$" + jsonPath))}";

	internal static string ReadDocumentDetailsPrefix(Guid gameId, Guid documentId) =>
		$"{BaseDocument(gameId, documentId)}:details:read";

	public static string WriteDocumentDetails(Guid gameId, Guid documentId, string jsonPath = "$") =>
		$"{WriteDocumentDetailsPrefix(gameId, documentId)}#{(jsonPath.StartsWith("$") ? jsonPath : ("$" + jsonPath))}";

	internal static string WriteDocumentDetailsPrefix(Guid gameId, Guid documentId) =>
		$"{BaseDocument(gameId, documentId)}:details:write";

	public static string ReadWriteDocumentDetails(Guid gameId, Guid documentId, string jsonPath = "$") =>
		$"{ReadWriteDocumentDetailsPrefix(gameId, documentId)}#{(jsonPath.StartsWith("$") ? jsonPath : ("$" + jsonPath))}";

	internal static string ReadWriteDocumentDetailsPrefix(Guid gameId, Guid documentId) =>
		$"{BaseDocument(gameId, documentId)}:details:*";

	public static PermissionSet ToPermissionSet(this IGameType gameType, GameUserModel gameUser) =>
		new PermissionSet(gameUser, gameType.GetPermissions(gameUser.GameId, gameUser.Role));

}

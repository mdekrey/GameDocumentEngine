using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Security;
using System.Collections.Immutable;

namespace GameDocumentEngine.Server.Documents;

public static class GameSecurity
{
	public static string BaseGame(long gameId) => $"game:{Identifier.ToString(gameId)}";

	public static string AnyBasicGamePermission(long gameId) => $"{BaseGame(gameId)}:*";
	public static string ViewGame(long gameId) => $"{BaseGame(gameId)}:read";
	public static string DeleteGame(long gameId) => $"{BaseGame(gameId)}:delete";
	public static string ExportGame(long gameId) => $"{BaseGame(gameId)}:export";
	public static string ImportIntoGame(long gameId) => $"{BaseGame(gameId)}:import";
	public static string UpdateGame(long gameId) => $"{BaseGame(gameId)}:update";
	public static string CreateDocument(long gameId) => $"{BaseGame(gameId)}:create-document";
	public static string UpdateGameUserAccess(long gameId) => $"{BaseGame(gameId)}:change-permissions";
	public static string ListInvitations(long gameId) => $"{BaseGame(gameId)}:invitations:list";
	public static string AnyInvitationPermission(long gameId) => $"{BaseGame(gameId)}:invitations:**";
	public static string CreateAnyInvitation(long gameId) => $"{BaseGame(gameId)}:invitations:create:*";
	public static string CreateInvitation(long gameId, string role) => $"{BaseGame(gameId)}:invitations:create:role-{role}";
	public static string CancelInvitation(long gameId) => $"{BaseGame(gameId)}:invitations:cancel";
	public static string SeeAnyDocument(long gameId) => $"{BaseGame(gameId)}:document:*:view";
	public static string DeleteAnyDocument(long gameId) => $"{BaseGame(gameId)}:document:*:delete";
	public static string BaseDocument(long gameId, long documentId) => $"{BaseGame(gameId)}:document:{Identifier.ToString(documentId)}";
	public static string DeleteDocument(long gameId, long documentId) => $"{BaseDocument(gameId, documentId)}:delete";
	public static string UpdateAnyDocumentUserAccess(long gameId) => $"{BaseGame(gameId)}:document:*:change-permissions";
	public static string UpdateAnyDocumentOwnAccess(long gameId) => $"{BaseGame(gameId)}:document:*:change-my-permissions";
	public static string UpdateDocumentUserAccess(long gameId, long documentId) => $"{BaseDocument(gameId, documentId)}:change-permissions";
	public static string UpdateDocumentAccessForSelf(long gameId, long documentId) => $"{BaseDocument(gameId, documentId)}:change-my-permissions";

	/// <summary>
	/// Allows knowledge of the document's existence
	/// </summary>
	public static string SeeDocument(long gameId, long documentId) => $"{BaseDocument(gameId, documentId)}:view";

	public static string ReadDocumentDetails(long gameId, long documentId, string jsonPath = "$") =>
		$"{ReadDocumentDetailsPrefix(gameId, documentId)}#{(jsonPath.StartsWith("$") ? jsonPath : ("$" + jsonPath))}";

	internal static string ReadDocumentDetailsPrefix(long gameId, long documentId) =>
		$"{BaseDocument(gameId, documentId)}:details:read";

	public static string WriteDocumentDetails(long gameId, long documentId, string jsonPath = "$") =>
		$"{WriteDocumentDetailsPrefix(gameId, documentId)}#{(jsonPath.StartsWith("$") ? jsonPath : ("$" + jsonPath))}";

	internal static string WriteDocumentDetailsPrefix(long gameId, long documentId) =>
		$"{BaseDocument(gameId, documentId)}:details:write";

	public static string ReadWriteDocumentDetails(long gameId, long documentId, string jsonPath = "$") =>
		$"{ReadWriteDocumentDetailsPrefix(gameId, documentId)}#{(jsonPath.StartsWith("$") ? jsonPath : ("$" + jsonPath))}";

	internal static string ReadWriteDocumentDetailsPrefix(long gameId, long documentId) =>
		$"{BaseDocument(gameId, documentId)}:details:*";

	public static PermissionSet ToPermissionSet(this IGameType gameType, GameUserModel gameUser) =>
		new PermissionSet(gameUser, gameType.GetPermissions(gameUser.GameId, gameUser.Role));

}

using GameDocumentEngine.Server.Security;
using System.Collections.Immutable;

using static GameDocumentEngine.Server.Documents.GameSecurity;

namespace GameDocumentEngine.Server.Documents;

public interface IGameType
{
	private static readonly ImmutableArray<string> GameRoles = new[]
	{
		"gm",
		"asst-gm",
		"trusted",
		"player"
	}.ToImmutableArray();

	string Key { get; }
	IEnumerable<IGameObjectType> ObjectTypes { get; }


	IEnumerable<string> Roles => GameRoles;
	string DefaultNewGameRole => "gm";
	PermissionList GetPermissions(long gameId, string role)
	{
		switch (role)
		{
			case "gm":
				return PermissionList.From(
					AnyBasicGamePermission(gameId),
					AnyInvitationPermission(gameId),
					SeeAnyDocument(gameId),
					DeleteAnyDocument(gameId),
					UpdateAnyDocumentUserAccess(gameId),
					UpdateAnyDocumentOwnAccess(gameId)
				);
			case "asst-gm":
				return PermissionList.From(
					ViewGame(gameId),
					UpdateGame(gameId),
					CreateDocument(gameId),
					ListInvitations(gameId),
					CreateInvitation(gameId, "asst-gm"),
					CreateInvitation(gameId, "trusted"),
					CreateInvitation(gameId, "player"),
					CancelInvitation(gameId)
				);
			case "trusted":
				return PermissionList.From(
					ViewGame(gameId),
					CreateDocument(gameId)
				);

			default:
			case "player":
				return PermissionList.From(
					ViewGame(gameId)
				);
		}
	}
}

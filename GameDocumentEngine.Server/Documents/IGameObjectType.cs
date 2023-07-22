using GameDocumentEngine.Server.Security;

namespace GameDocumentEngine.Server.Documents;

public interface IGameObjectType
{
	string Name { get; }

	IReadOnlyList<string> PermissionLevels { get; }
	string DefaultPermissionLevel { get; }
	string CreatorPermissionLevel { get; }

	/// <summary>
	/// Determines additional permissions based on user's role for the object
	/// </summary>
	IEnumerable<string> GetPermissions(Guid gameId, Guid documentId, string role);
}

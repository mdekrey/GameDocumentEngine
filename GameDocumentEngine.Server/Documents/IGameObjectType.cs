using GameDocumentEngine.Server.Security;

namespace GameDocumentEngine.Server.Documents;

public interface IGameObjectType
{
	string Key { get; }

	IReadOnlyList<string> PermissionLevels { get; }
	string CreatorPermissionLevel { get; }

	/// <summary>
	/// Determines additional permissions based on user's role for the object
	/// </summary>
	IEnumerable<string> GetPermissions(Guid gameId, Guid documentId, string role);
	Task<IEnumerable<string>> ResolveScripts(RollupManifestManager manifestManager);
}

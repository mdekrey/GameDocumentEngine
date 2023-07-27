using System.Text.Json.Serialization;

namespace GameDocumentEngine.Server.Documents;

public class JsonGameObjectType : IGameObjectType
{
#pragma warning disable
	[JsonPropertyName("name")]
	public string Key { get; set; }

	[JsonPropertyName("script")]
	public JsonGameObjectTypeScript Script { get; set; }

	[JsonPropertyName("roles")]
	public Dictionary<string, JsonGameObjectTypeRole> Roles { get; set; }

	public IReadOnlyList<string> PermissionLevels => Roles.Keys.ToArray();

	public string DefaultPermissionLevel => Roles.Single(kvp => kvp.Value.IsDefault).Key;

	public string CreatorPermissionLevel => Roles.Single(kvp => kvp.Value.IsCreatorDefault).Key;

	public IEnumerable<string> GetPermissions(Guid gameId, Guid documentId, string role)
	{
		var basePermission = GameSecurity.BaseDocument(gameId, documentId);
		return Roles[role].Permissions.Select(permission => $"{basePermission}:{permission}");
	}

	public Task<IEnumerable<string>> ResolveScripts(RollupManifestManager manifestManager)
	{
		if (Script.ScriptType == "manifest")
		{
			return manifestManager.ResolveScript(Script.Path);
		}
		else
		{
			throw new NotSupportedException("Only 'manifest' script types are allowed at this time");
		}
	}

	public class JsonGameObjectTypeScript
	{
		[JsonPropertyName("type")]
		public String ScriptType { get; set; }

		[JsonPropertyName("path")]
		public string Path { get; set; }
	}

	public class JsonGameObjectTypeRole
	{
		[JsonPropertyName("default")]
		public bool IsDefault { get; set; }

		[JsonPropertyName("creatorDefault")]
		public bool IsCreatorDefault { get; set; }

		[JsonPropertyName("permissions")]
		public IEnumerable<string> Permissions { get; set; }
	}
}

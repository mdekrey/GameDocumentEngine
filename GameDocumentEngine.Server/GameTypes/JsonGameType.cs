using GameDocumentEngine.Server.Documents;
using GameDocumentEngine.Server.Security;
using System.Text.Json.Serialization;
using static GameDocumentEngine.Server.Documents.GameSecurity;

namespace GameDocumentEngine.Server.GameTypes;

public class JsonGameTypeBuilder
{
#pragma warning disable
	[JsonPropertyName("key")]
	public string Key { get; set; }

	[JsonPropertyName("objectTypes")]
	public IEnumerable<string> ObjectTypes { get; set; }
	[JsonPropertyName("defaultNewGameRole")]
	public string DefaultNewGameRole { get; set; } = "gm";
	[JsonPropertyName("permissions")]
	public IReadOnlyDictionary<string, IEnumerable<string>> Permissions { get; set; } = new Dictionary<string, IEnumerable<string>>()
	{
		["gm"] = new[] {
			"*",
			"invitations:**",
			"document:*:view",
			"document:*:delete",
			"document:*:change-permissions",
			"document:*:change-my-permissions"
		},
		["asst-gm"] = new[] {
			"read",
			"update",
			"create-document",
			"invitations:list",
			"invitations:create:role-asst-gm",
			"invitations:create:role-trusted",
			"invitations:create:role-player",
			"invitations:cancel"
		},
		["trusted"] = new[] {
			"read",
			"create-document"
		},
		["player"] = new[] {
			"read"
		}
	};

#pragma warning restore

	public IGameType Build(IEnumerable<IGameObjectType> gameObjectTypes)
	{
		return new JsonGameType(
			Key: Key,
			ObjectTypes: gameObjectTypes.Where(t => ObjectTypes.Contains(t.Key)).ToArray(),
			DefaultNewGameRole: DefaultNewGameRole,
			Permissions: Permissions
		);
	}

	private record JsonGameType(
		string Key,
		IEnumerable<IGameObjectType> ObjectTypes,
		string DefaultNewGameRole,
		IReadOnlyDictionary<string, IEnumerable<string>> Permissions) : IGameType
	{
		IEnumerable<string> IGameType.Roles => Permissions.Keys;
		PermissionList IGameType.GetPermissions(long gameId, string role)
		{
			if (!Permissions.TryGetValue(role, out var permissions))
				throw new InvalidOperationException($"Unknown role {role} for game type {Key}");
			return PermissionList.From(permissions.Select(postfix => $"{BaseGame(gameId)}:{postfix}"));
		}
	}
}

﻿using System.Text.Json.Serialization;

namespace GameDocumentEngine.Server.Documents;

public class JsonGameObjectType : IGameObjectType
{
#pragma warning disable
	[JsonPropertyName("name")]
	public string Key { get; set; }

	[JsonPropertyName("script")]
	public JsonGameObjectTypeScript Script { get; set; }

	/*
	The default roles:
	"roles": {
		"owner": {
			"creatorDefault": true,
			"permissions": ["**", "details:*#$..*"]
		},
		"observer": {
			"default": false,
			"permissions": ["view", "details:read#$..*"]
		}
	}
*/
	[JsonPropertyName("roles")]
	public Dictionary<string, JsonGameObjectTypeRole> Roles { get; set; } = new Dictionary<string, JsonGameObjectTypeRole>()
	{
		["owner"] = new JsonGameObjectTypeRole
		{
			IsCreatorDefault = true,
			Permissions = new[] { "**", "details:*#$..*" }
		},
		["observer"] = new JsonGameObjectTypeRole
		{
			Permissions = new[] { "view", "details:read#$..*" }
		},
	};

	public IReadOnlyList<string> PermissionLevels => Roles.Keys.ToArray();

	public string CreatorPermissionLevel => Roles.Single(kvp => kvp.Value.IsCreatorDefault).Key;

	public IEnumerable<string> GetPermissions(long gameId, long documentId, string role)
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
		[JsonPropertyName("creatorDefault")]
		public bool IsCreatorDefault { get; set; }

		[JsonPropertyName("permissions")]
		public IEnumerable<string> Permissions { get; set; }
	}
}

﻿namespace GameDocumentEngine.Server.Documents.Types;

public static class GameObjectTypeExtensions
{
	public static string SchemaManifestResourceName(this IGameObjectType gameObjectType) =>
		$"Documents.Types.{gameObjectType.Name}.schema.json";
	public static string UiPath(this IGameObjectType gameObjectType) =>
		$"src/documents/{gameObjectType.Name.ToLower()}/index.ts";

}
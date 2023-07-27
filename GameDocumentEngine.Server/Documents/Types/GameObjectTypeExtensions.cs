namespace GameDocumentEngine.Server.Documents.Types;

public static class GameObjectTypeExtensions
{
	public static string SchemaManifestResourceName(this IGameObjectType gameObjectType) =>
		$"Documents.Types.{gameObjectType.Key}.schema.json";

}

using Microsoft.Extensions.Caching.Memory;

namespace GameDocumentEngine.Server.Documents.Types;

public class JsonSchemaResolver
{
	private readonly IMemoryCache cache;
	private record SchemaCacheKey(string schemaName);

	public JsonSchemaResolver(IMemoryCache cache)
	{
		this.cache = cache;
	}

	public async Task<object> GetOrLoadSchema(IGameObjectType gameObjectType)
	{
		var resourceName = gameObjectType.SchemaManifestResourceName();
		using var resourceStream = gameObjectType.GetType().Assembly.GetManifestResourceStream(resourceName);
		if (resourceStream == null)
		{
			throw new NotImplementedException("The schema file is not embedded in the GameObjectType's assembly");
		}
		using var textReader = new StreamReader(resourceStream);
		var schemaText = await textReader.ReadToEndAsync();

		return new SchemaCacheKey(gameObjectType.Name);
	}
}

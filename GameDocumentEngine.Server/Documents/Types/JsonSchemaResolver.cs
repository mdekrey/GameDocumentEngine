using GameDocumentEngine.Server.Tracing;
using Json.Schema;
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

	public async Task<JsonSchema> GetOrLoadSchema(IGameObjectType gameObjectType)
	{
		var key = new SchemaCacheKey(gameObjectType.Key);
		return await cache.GetOrCreateAsync<JsonSchema>(key, async (entry) =>
		{
			using var _ = TracingHelper.StartActivity("Load schema");
			var resourceName = gameObjectType.SchemaManifestResourceName();
			using var resourceStream = gameObjectType.GetType().Assembly.GetManifestResourceStream(resourceName);
			if (resourceStream == null)
			{
				throw new NotImplementedException("The schema file is not embedded in the GameObjectType's assembly");
			}
			using var textReader = new StreamReader(resourceStream);
			var schemaText = await textReader.ReadToEndAsync();
			var schema = JsonSchema.FromText(schemaText);
			if (schema == null)
			{
				throw new InvalidOperationException("Could not parse schema");
			}

			return schema;
		}) ?? throw new InvalidOperationException("Unable to load schema from cache");
	}
}

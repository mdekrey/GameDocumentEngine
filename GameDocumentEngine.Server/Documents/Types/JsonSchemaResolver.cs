using GameDocumentEngine.Server.DynamicTypes;
using GameDocumentEngine.Server.Tracing;
using Json.Schema;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace GameDocumentEngine.Server.Documents.Types;

public class JsonSchemaResolver
{
	private readonly IMemoryCache cache;
	private readonly string documentSchemaPath;

	private record SchemaCacheKey(string schemaName);

	public JsonSchemaResolver(IMemoryCache cache, IOptions<DynamicTypeOptions> options)
	{
		this.cache = cache;
		this.documentSchemaPath = options.Value.DocumentSchemaPath;
	}

	public async Task<JsonSchema> GetOrLoadSchema(IGameObjectType gameObjectType)
	{
		var key = new SchemaCacheKey(gameObjectType.Key);
		return await cache.GetOrCreateAsync<JsonSchema>(key, async (entry) =>
		{
			using var _ = TracingHelper.StartActivity("Load schema");
			var schemaText = await System.IO.File.ReadAllTextAsync(documentSchemaPath.Replace("<documenttype>", gameObjectType.Key));
			var schema = JsonSchema.FromText(schemaText);
			if (schema == null)
			{
				throw new InvalidOperationException("Could not parse schema");
			}

			return schema;
		}) ?? throw new InvalidOperationException("Unable to load schema from cache");
	}
}

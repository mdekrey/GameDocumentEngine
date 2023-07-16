using System.Collections.Immutable;
using System.IO;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace GameDocumentEngine.Server.Documents;

public class GameTypes
{
	private readonly GameObjectManifestManager gameObjectManifestManager;

	public GameTypes(IEnumerable<IGameType> gameTypes, GameObjectManifestManager gameObjectManifestManager)
	{
		this.All = gameTypes.ToImmutableDictionary(g => g.Name);
		this.gameObjectManifestManager = gameObjectManifestManager;
	}

	public ImmutableDictionary<string, IGameType> All { get; }

	public Task<IEnumerable<string>> ResolveGameObjectScripts(IGameObjectType gameObjectType) =>
		gameObjectManifestManager.ResolveGameObjectScripts(gameObjectType);

}

public class GameObjectManifestManager
{
#if !DEBUG
	private readonly Lazy<Task<JsonNode>> AssetManifest;
	
	public GameObjectManifestManager(IWebHostEnvironment webHostEnvironment)
	{
		AssetManifest = new Lazy<Task<JsonNode>>(LoadAssetManifest(webHostEnvironment.WebRootPath));
	}

	private Task<JsonNode> GetAssetManifest() => AssetManifest.Value;


	private async Task<JsonNode> LoadAssetManifest(string webRootPath)
#else
	private readonly string webRootPath;

	public GameObjectManifestManager(IWebHostEnvironment webHostEnvironment)
	{
		webRootPath = webHostEnvironment.WebRootPath;
	}

	private async Task<JsonNode> GetAssetManifest()
#endif
	{
		var manifestPath = Path.Join(webRootPath, "manifest.json");
		using var stream = File.OpenRead(manifestPath);
		var manifest = await JsonSerializer.DeserializeAsync<JsonNode>(stream);
		if (manifest == null) throw new InvalidOperationException("Could not load manifest.json");
		return manifest;
	}


	internal async Task<IEnumerable<string>> ResolveGameObjectScripts(IGameObjectType gameObjectType)
	{
		var assetManifest = await GetAssetManifest();
		var node = assetManifest[$"src/documents/{gameObjectType.Name.ToLower()}/index.ts"];
		return new[] { node!["file"]!.GetValue<string>() };
	}
}
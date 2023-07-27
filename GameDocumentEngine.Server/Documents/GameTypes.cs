using System.Collections.Immutable;
using System.IO;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace GameDocumentEngine.Server.Documents;

public class GameTypes
{
	private readonly RollupManifestManager manifestManager;

	public GameTypes(IEnumerable<IGameType> gameTypes, RollupManifestManager manifestManager)
	{
		this.All = gameTypes.ToImmutableDictionary(g => g.Key);
		this.manifestManager = manifestManager;
	}

	public ImmutableDictionary<string, IGameType> All { get; }

	public Task<IEnumerable<string>> ResolveGameObjectScripts(IGameObjectType gameObjectType) =>
		gameObjectType.ResolveScripts(manifestManager);

}

public class RollupManifestManager
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

	public RollupManifestManager(IWebHostEnvironment webHostEnvironment)
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


	internal async Task<IEnumerable<string>> ResolveScript(string path)
	{
		var assetManifest = await GetAssetManifest();
		var node = assetManifest[path];
		return new[] { node!["file"]!.GetValue<string>() };
	}

}
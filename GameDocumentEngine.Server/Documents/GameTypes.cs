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
#else
	private readonly string webRootPath;
#endif

	public RollupManifestManager(IWebHostEnvironment webHostEnvironment)
	{
#if !DEBUG
		AssetManifest = new Lazy<Task<JsonNode>>(LoadAssetManifest(webHostEnvironment.WebRootPath));
#else
		webRootPath = webHostEnvironment.WebRootPath;
#endif
	}

#if !DEBUG
	private Task<JsonNode> GetAssetManifest() => AssetManifest.Value;
#else
	private async Task<JsonNode> GetAssetManifest() => LoadAssetManifest(webRootPath);
#endif

	private static async Task<JsonNode> LoadAssetManifest(string webRootPath)
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
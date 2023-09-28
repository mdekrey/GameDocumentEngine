using GameDocumentEngine.Server.Api;
using Microsoft.Extensions.Options;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Xml.Linq;

namespace GameDocumentEngine.Server.Localization;

public class LocalizationController : LocalesControllerBase
{
	private const string docTypeNsPrefix = "doc-types:";
	private const string gameTypeNsPrefix = "game-types:";
	private readonly LocalizationOptions localizationOptions;

	public LocalizationController(IOptions<LocalizationOptions> options)
	{
		localizationOptions = options.Value;
	}

	protected override async Task<GetTranslationDataActionResult> GetTranslationData(string lng, string ns)
	{
		var namespaces = ns.Split(' ');
		var languages = lng.Split(' ');

		var allData = (await LoadTranslationData(languages, namespaces));

		return GetTranslationDataActionResult.Ok(
			new(
				from t in allData
				where t.Content != null
				group (t.Namespace, Content: t.Content!) by t.Language into byLanguage
				select new KeyValuePair<string, Dictionary<string, JsonNode>>(
					byLanguage.Key,
					byLanguage.ToDictionary(e => e.Namespace, e => e.Content)
				)
		));
	}

	private async Task<(string Language, string Namespace, JsonNode? Content)[]> LoadTranslationData(string[] languages, string[] namespaces)
	{
		return await Task.WhenAll(
			from lng in languages
			from ns in namespaces
			select Load(lng: lng, ns: ns)
		);
		async Task<(string Language, string Namespace, JsonNode? Content)> Load(string lng, string ns) =>
			(lng, ns, await LoadNamespace(language: lng, ns: ns));
	}

	private Task<JsonNode?> LoadNamespace(string language, string ns)
	{
		switch (ns)
		{
			case var s when s.StartsWith(docTypeNsPrefix): return LoadDocType(language, ns.Substring(docTypeNsPrefix.Length));
			case var s when s.StartsWith(gameTypeNsPrefix): return LoadGameType(language, ns.Substring(gameTypeNsPrefix.Length));
			default: return LoadOtherNamespace(language, ns);
		}
	}

	private Task<JsonNode?> LoadDocType(string language, string docType)
	{
		return Load(localizationOptions.DocumentTypesRoot
			.Replace("<lang>", language)
			.Replace("<documenttype>", docType));
	}

	private Task<JsonNode?> LoadGameType(string language, string gameType)
	{
		return Load(localizationOptions.GameTypesRoot
			.Replace("<lang>", language)
			.Replace("<gametype>", gameType));
	}

	private async Task<JsonNode?> LoadOtherNamespace(string language, string ns)
	{
		var result = await Load(localizationOptions.StandardRoot
			.Replace("<lang>", language)
			.Replace("<namespace>", ns));
		if (result != null) return result;
		var bundle = await Load(localizationOptions.BundleRoot.Replace("<lang>", language));
		return bundle?[ns];
	}

	private async Task<JsonNode?> Load(string filePath)
	{
		if (!System.IO.File.Exists(filePath)) return null;
		var fileContents = await System.IO.File.ReadAllTextAsync(filePath);
		return JsonSerializer.Deserialize<JsonNode>(fileContents);
	}
}

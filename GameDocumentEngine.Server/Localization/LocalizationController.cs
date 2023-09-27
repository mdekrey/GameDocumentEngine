using GameDocumentEngine.Server.Api;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace GameDocumentEngine.Server.Localization;

public class LocalizationController : LocalesControllerBase
{
	protected override Task<GetTranslationDataActionResult> GetTranslationData(string lng, string ns)
	{
		var result = JsonSerializer.Deserialize<Dictionary<string, JsonNode>>(System.IO.File.ReadAllText(@"C:\Users\mattd\Source\GameDocumentEngine\GameDocumentEngine.Ui\src\utils\i18n\en.json"));
		if (result == null) throw new InvalidOperationException("Not really implemented");
		// TODO
		return Task.FromResult(
			GetTranslationDataActionResult.Ok(new()
			{
				["en"] = result,
			})
		);
	}
}

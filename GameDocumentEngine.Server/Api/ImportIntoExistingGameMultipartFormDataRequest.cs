using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace GameDocumentEngine.Server.Api;

public class ImportIntoExistingGameMultipartFormDataRequest
{
#nullable disable
	[FromForm(Name = "archive")]
	[Required]
	public IFormFile Archive { get; set; }

	[FromForm(Name = "options")]
	[Required]
	public ImportIntoExistingGameOptions Options { get; set; }
#nullable restore
}

public partial record ImportIntoExistingGameOptions : IParsable<ImportIntoExistingGameOptions>
{
	public static ImportIntoExistingGameOptions Parse(string s, IFormatProvider? provider)
	{
		return System.Text.Json.JsonSerializer.Deserialize<ImportIntoExistingGameOptions>(s) ?? throw new ArgumentException("Invalid json", nameof(s));
	}

	public static bool TryParse([NotNullWhen(true)] string? s, IFormatProvider? provider, [MaybeNullWhen(false)] out ImportIntoExistingGameOptions result)
	{
		if (s == null)
		{
			result = null;
			return false;
		}
		result = System.Text.Json.JsonSerializer.Deserialize<ImportIntoExistingGameOptions>(s);
		if (result == null)
		{
			result = null;
			return false;
		}
		return true;
	}
}

using Json.More;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Text.Json.Nodes;

namespace GameDocumentEngine.Server.Data;

internal static class JsonValueConverter
{
	public static readonly ValueConverter<JsonNode, string> Instance = new ValueConverter<JsonNode, string>(
		node => node.ToJsonString(null),
		json => JsonNode.Parse(json, null, default)!
	);
}
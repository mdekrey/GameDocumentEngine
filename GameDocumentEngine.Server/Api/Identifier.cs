using Microsoft.IdentityModel.Tokens;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using static System.Net.Mime.MediaTypeNames;

namespace GameDocumentEngine.Server.Api;

[System.Text.Json.Serialization.JsonConverter(typeof(Identifier.SystemTextJsonConverter))]
public record Identifier(long Value) : IParsable<Identifier>
{
	// Adds entropy to the ID since GameIDs are incremental
	const long xorBits = 0x2c82937ceb532c7b;

	public static explicit operator Identifier(long value) => FromLong(value);
	public static explicit operator Identifier?(long? value) => value switch
	{
		long v => FromLong(v),
		_ => null,
	};
	// Omitting implicit operator to `long` because it is not supported by EFCore

	public static Identifier FromLong(long value) => new Identifier(value);
	[return: NotNullIfNotNull(nameof(value))]
	public static Identifier? FromLong(long? value) => value switch
	{
		long v => new Identifier(v),
		_ => null
	};
	[return: NotNullIfNotNull(nameof(value))]
	public static Identifier? FromString(string? value) => value switch
	{
		string v => FromLong(BitConverter.ToInt64(Base64UrlEncoder.DecodeBytes(v)) ^ xorBits),
		_ => null
	};
	public static string ToString(long value) => Base64UrlEncoder.Encode(BitConverter.GetBytes(value ^ xorBits));

	public static Identifier Parse(string s, IFormatProvider? provider)
	{
		return FromString(s);
	}

	public static bool TryParse([NotNullWhen(true)] string? s, IFormatProvider? provider, [MaybeNullWhen(false)] out Identifier result)
	{
		if (s == null)
		{
			result = null;
			return false;
		}
		try
		{
			result = FromString(s);
			return true;
		}
		catch
		{
			result = null;
			return false;
		}
	}

	class SystemTextJsonConverter : System.Text.Json.Serialization.JsonConverter<Identifier>
	{
		public override Identifier? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
		{
			var text = JsonSerializer.Deserialize<string?>(ref reader, options);
			if (text == null) return null;
			return FromString(text);
		}

		public override void Write(Utf8JsonWriter writer, Identifier? value, JsonSerializerOptions options)
		{
			if (value == null) writer.WriteNullValue();
			else writer.WriteStringValue(Identifier.ToString(value.Value));
		}
	}



	public class LongConverter : System.Text.Json.Serialization.JsonConverter<long>
	{
		public override long Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
		{
			var text = JsonSerializer.Deserialize<string?>(ref reader, options);
			return FromString(text)!.Value;
		}

		public override void Write(Utf8JsonWriter writer, long value, JsonSerializerOptions options)
		{
			writer.WriteStringValue(Identifier.ToString(value));
		}
	}
}

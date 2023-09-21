using Json.Schema;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

namespace GameDocumentEngine.Server.Json;

public class JsonSchemaTests
{
	/// <summary>
	/// An older version of JsonSchema.Net indicated that a `null` value in an array did not match the enumeration. This has been fixed, but I'm keeping the test.
	/// </summary>
	[Fact]
	public void NullableArraySchema()
	{
		var schema = new JsonSchemaBuilder()
			.Items(new JsonSchemaBuilder().Enum(null, JsonValue.Create("foo"), JsonValue.Create("bar"), JsonValue.Create("baz")).Build())
			.Type(SchemaValueType.Array)
			.MaxItems(3)
			.Build();

		var result = schema.Evaluate(JsonNode.Parse(@"[null, ""foo""]"), new EvaluationOptions { OutputFormat = OutputFormat.Hierarchical });
		Assert.True(result.IsValid);
	}
}

using Json.More;
using Json.Path;
using Json.Pointer;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

namespace GameDocumentEngine.Server.Json;

public class JsonPathTests
{
	private static readonly JsonNode targetNode = JsonSerializer.SerializeToNode(new
	{
		deep = new
		{
			structure = new { value = (string?)null },
			value = "kept",
			ignored = new { complex = "value" },
		},
		ignored = "top-level",
		partial = new object[]
		{
			new { ignored = true },
			new { value = "present" },
		},
	}) ?? throw new InvalidOperationException("Serializing this should not result in null");

	[Theory]
	// find null element
	[InlineData("/deep/structure/value")]
	// find array item
	[InlineData("/partial/1/value")]
	public void FindPathsForNullElements(string expectedPointer)
	{
		var path = JsonPath.Parse("$..value");

		var result = path.Evaluate(targetNode);

		Assert.Null(result.Error);
		Assert.NotNull(result.Matches);

		Assert.Contains(result.Matches, match =>
		{
			return match.Location?.AsJsonPointer() == expectedPointer;
		});
	}

	[Fact]
	public void FilterNodesByPathsRemovesIgnoredProps()
	{
		var result = targetNode.FilterNode(new[] { "$..value" });

		var ignoredNodes = JsonPath.Parse("$..ignored").Evaluate(result);

		Assert.Null(ignoredNodes.Error);
		Assert.NotNull(ignoredNodes.Matches);
		Assert.Empty(ignoredNodes.Matches);

	}

	[Theory]
	// find null element
	[InlineData("/deep/structure/value")]
	// find array item at new index
	[InlineData("/partial/0/value")]
	public void FilterNodesByPathsIncludes(string expectedPointer)
	{
		var result = targetNode.FilterNode(new[] { "$..value" });

		var valueNodes = JsonPath.Parse("$..value").Evaluate(result);

		Assert.Null(valueNodes.Error);
		Assert.NotNull(valueNodes.Matches);

		Assert.Contains(valueNodes.Matches, match =>
		{
			return match.Location?.AsJsonPointer() == expectedPointer;
		});
	}

}

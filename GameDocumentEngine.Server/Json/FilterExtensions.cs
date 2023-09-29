using GameDocumentEngine.Server.Documents;
using Json.More;
using Json.Patch;
using Json.Path;
using Newtonsoft.Json.Linq;
using System.Diagnostics.CodeAnalysis;
using System.Reflection.Metadata;
using System.Text.Json.Nodes;

namespace GameDocumentEngine.Server.Json;

public static class FilterExtensions
{
	public static IEnumerable<JsonPath> GetMatchingPaths(this JsonNode? target, IEnumerable<string> jsonPaths)
	{
		foreach (var path in jsonPaths)
		{
			var parsed = JsonPath.Parse(path);
			var result = parsed.Evaluate(target);

			if (result.Matches == null) continue;
			foreach (var match in result.Matches)
			{
				if (match.Location == null) throw new InvalidOperationException("Why?");

				yield return match.Location;
			}
		}

	}

	public static bool HasOnlyAllowedPaths<T>(this JsonPatch patch, T target, IEnumerable<string> paths)
	{
		var node = System.Text.Json.JsonSerializer.SerializeToNode(target);
		var allowedPaths = (from path in node.GetMatchingPaths(paths)
							select path.AsJsonPointer()).Distinct().ToHashSet();
		return patch.Operations.All(op =>
		{
			var test = op.Path.ToString();
			return allowedPaths.Any(path => test.StartsWith(path));
		});
	}

	[return: NotNullIfNotNull(nameof(target))]
	public static JsonNode? FilterNode(this JsonNode? target, string[] jsonPaths)
	{
		var pointers = from path in target.GetMatchingPaths(jsonPaths)
					   from i in Enumerable.Range(1, path.Segments.Length)
					   select path.Segments[..i];

		return BuildNodeFrom(target, pointers);
	}

	[return: NotNullIfNotNull(nameof(target))]
	private static JsonNode? BuildNodeFrom(JsonNode? target, IEnumerable<IEnumerable<PathSegment>> pointers)
	{
		switch (target)
		{
			case JsonObject obj:
				return BuildObjectFrom(obj, pointers);
			case JsonArray array:
				return BuildArrayFrom(array, pointers);
			case null:
				return null;
			case JsonValue value:
				// TODO: is this a Json.More bug with not using `NotNullIfNotNull`?
				return value.Copy() as JsonValue ?? throw new InvalidOperationException("The value was not a value");
			default:
				throw new InvalidOperationException("Unknown System.Text.Json.Nodes Type");
		}

		static JsonObject BuildObjectFrom(JsonObject target, IEnumerable<IEnumerable<PathSegment>> pointers)
		{
			var result = new JsonObject();
			var props = GroupSegments(pointers).ToArray();
			foreach (var pair in props)
			{
				if (pair.Head.Selectors[0] is not NameSelector { Name: var propName }) throw new InvalidOperationException("Did not have a property name");
				result.Add(propName, BuildNodeFrom(target[propName], pair.Tails));
			}
			return result;
		}

		static JsonArray BuildArrayFrom(JsonArray target, IEnumerable<IEnumerable<PathSegment>> pointers)
		{
			var result = new JsonArray();
			var props = GroupSegments(pointers).ToArray();
			foreach (var pair in props)
			{
				if (pair.Head.Selectors[0] is not IndexSelector { Index: var index }) throw new InvalidOperationException("Did not have a property name");
				result.Add(BuildNodeFrom(target[index], pair.Tails));
			}
			return result;
		}

		static IEnumerable<(PathSegment Head, IEnumerable<IEnumerable<PathSegment>> Tails)> GroupSegments(IEnumerable<IEnumerable<PathSegment>> pointers) =>
			from pointer in pointers
			let segments = pointer.ToArray()
			where segments.Length > 0
			let head = segments.First()
			let tail = segments.Skip(1)
			group (head, tail) by head.ToString() into entries
			select (entries.First().head, from v in entries select v.tail);
	}
}

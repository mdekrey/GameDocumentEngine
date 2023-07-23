using Json.More;
using Json.Path;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Nodes;

namespace GameDocumentEngine.Server.Json;

public static class FilterExtensions
{
	[return: NotNullIfNotNull(nameof(target))]
	public static JsonNode? FilterNode(this JsonNode? target, string[] jsonPaths)
	{
		var pointers = new HashSet<IEnumerable<PathSegment>>();

		foreach (var path in jsonPaths)
		{
			var parsed = JsonPath.Parse(path);
			var result = parsed.Evaluate(target);

			if (result.Matches == null) continue;
			foreach (var match in result.Matches)
			{
				if (match.Location == null) throw new InvalidOperationException("Why?");

				var current = Enumerable.Empty<PathSegment>();
				for (var i = 0; i < match.Location.Segments.Length; i++)
				{
					current = current.Append(match.Location.Segments[i]);
					pointers.Add(current);
				}
			}
		}

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
				// TODO: is this a Json.More bug with not using `NotNullIfNull`?
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
				if (pair.Key.Selectors[0] is not NameSelector { Name: var propName }) throw new InvalidOperationException("Did not have a property name");
				result.Add(propName, BuildNodeFrom(target[propName], pair));
			}
			return result;
		}

		static JsonArray BuildArrayFrom(JsonArray target, IEnumerable<IEnumerable<PathSegment>> pointers)
		{
			var result = new JsonArray();
			var props = GroupSegments(pointers).ToArray();
			foreach (var pair in props)
			{
				if (pair.Key.Selectors[0] is not IndexSelector { Index: var index }) throw new InvalidOperationException("Did not have a property name");
				result.Add(BuildNodeFrom(target[index], pair));
			}
			return result;
		}

		static IEnumerable<IGrouping<PathSegment, IEnumerable<PathSegment>>> GroupSegments(IEnumerable<IEnumerable<PathSegment>> pointers) =>
			from pointer in pointers
			let segments = pointer.ToArray()
			where segments.Length > 0
			let head = segments.First()
			let tail = segments.Skip(1)
			group tail by head;
	}
}

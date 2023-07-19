using GameDocumentEngine.Server.Documents;
using System.Collections.Immutable;

namespace GameDocumentEngine.Server.Documents.Types.Clock;

public class ClockGameObject : IGameObjectType
{
	public string Name => "Clock";

	public IReadOnlyList<string> PermissionLevels { get; } = new[]
	{
		"owner",
		"observer"
	}.ToImmutableArray();

	public string DefaultPermissionLevel => "observer";

	public string CreatorPermissionLevel => "owner";
}

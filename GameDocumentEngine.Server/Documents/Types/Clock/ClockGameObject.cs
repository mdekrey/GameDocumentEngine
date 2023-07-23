using GameDocumentEngine.Server.Documents;
using GameDocumentEngine.Server.Security;
using System.Collections.Immutable;
using static GameDocumentEngine.Server.Documents.GameSecurity;

namespace GameDocumentEngine.Server.Documents.Types.Clock;

public class ClockGameObject : IGameObjectType
{
	public string Name => "Clock";

	public IReadOnlyList<string> PermissionLevels { get; } = new[]
	{
		"owner",
		"ticker",
		"observer",
		"doomsday"
	}.ToImmutableArray();

	public string DefaultPermissionLevel => "observer";

	public string CreatorPermissionLevel => "owner";

	public IEnumerable<string> GetPermissions(Guid gameId, Guid documentId, string role)
	{
		yield return SeeDocument(gameId, documentId);
		switch (role)
		{
			case "owner":
				yield return $"{BaseDocument(gameId, documentId)}:**";
				yield return GameSecurity.ViewDocumentDetails(gameId, documentId, "$..*");
				yield break;
			case "ticker":
				yield return $"{BaseDocument(gameId, documentId)}:view";
				yield return $"{BaseDocument(gameId, documentId)}:edit:ticks";
				yield return GameSecurity.ViewDocumentDetails(gameId, documentId, "$..*");
				yield break;
			case "observer":
				yield return $"{BaseDocument(gameId, documentId)}:view";
				yield return GameSecurity.ViewDocumentDetails(gameId, documentId, "$..*");
				yield break;
			case "doomsday":
				yield return $"{BaseDocument(gameId, documentId)}:view";
				yield return GameSecurity.ViewDocumentDetails(gameId, documentId, "$..max");
				yield break;
		}
	}
}

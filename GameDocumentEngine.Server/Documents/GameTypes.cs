using System.Collections.Immutable;

namespace GameDocumentEngine.Server.Documents;

public class GameTypes
{
	public GameTypes(IEnumerable<IGameType> gameTypes)
	{
		this.All = gameTypes.ToImmutableDictionary(g => g.Name);
	}

	public ImmutableDictionary<string, IGameType> All { get; }
}

using GameDocumentEngine.Server.Documents;

namespace GameDocumentEngine.Server.GameTypes.Clocks;

public class ClocksGameType : IGameType
{
	private readonly IReadOnlyList<IGameObjectType> objectTypes;

	public ClocksGameType(IEnumerable<IGameObjectType> gameObjectTypes)
	{
		var typeNames = new[] { "Clock" };
		objectTypes = gameObjectTypes.Where(t => typeNames.Contains(t.Key)).ToArray();
	}

	public string Key => "Clocks";

	public IEnumerable<IGameObjectType> ObjectTypes => objectTypes;
}

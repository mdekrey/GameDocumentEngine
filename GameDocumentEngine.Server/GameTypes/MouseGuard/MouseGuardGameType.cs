using GameDocumentEngine.Server.Documents;

namespace GameDocumentEngine.Server.GameTypes.MouseGuard;

public class MouseGuardGameType : IGameType
{
	private readonly IReadOnlyList<IGameObjectType> objectTypes;

	public MouseGuardGameType(IEnumerable<IGameObjectType> gameObjectTypes)
	{
		var typeNames = new[] { "Clock", "MouseGuard-Character", "MouseGuard-Conflict" };
		objectTypes = gameObjectTypes.Where(t => typeNames.Contains(t.Key)).ToArray();
	}

	public string Key => "MouseGuard";

	public IEnumerable<IGameObjectType> ObjectTypes => objectTypes;
}

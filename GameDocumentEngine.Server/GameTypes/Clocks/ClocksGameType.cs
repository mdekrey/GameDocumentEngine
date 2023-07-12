using GameDocumentEngine.Server.Documents;
using GameDocumentEngine.Server.GameTypes.SharedObjects;

namespace GameDocumentEngine.Server.GameTypes.Clocks;

public class ClocksGameType : IGameType
{
	private static readonly IReadOnlyList<IGameObjectType> objectTypes = new IGameObjectType[]
	{
		new ClockGameObject(),
	};

	public string Name => "Clocks";

	public string Description => "A simple game type to track PbtA-style clocks";

	public IEnumerable<IGameObjectType> ObjectTypes => objectTypes;
}

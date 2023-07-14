using GameDocumentEngine.Server.Documents;

namespace GameDocumentEngine.Server.GameTypes.Clocks;

public class ClocksGameType : IGameType
{
	private static readonly IReadOnlyList<IGameObjectType> objectTypes = new IGameObjectType[]
	{
		new Documents.Types.Clock.ClockGameObject(),
	};

	public string Name => "Clocks";

	public string Description => "A simple game type to track PbtA-style clocks";

	public IEnumerable<IGameObjectType> ObjectTypes => objectTypes;
}

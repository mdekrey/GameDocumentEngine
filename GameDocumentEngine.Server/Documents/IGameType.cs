namespace GameDocumentEngine.Server.Documents;

public interface IGameType
{
	string Name { get; }
	string Description { get; }
	IEnumerable<IGameObjectType> ObjectTypes { get; }
}

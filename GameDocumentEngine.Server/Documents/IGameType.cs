namespace GameDocumentEngine.Server.Documents;

public interface IGameType
{
	string Key { get; }
	IEnumerable<IGameObjectType> ObjectTypes { get; }
}

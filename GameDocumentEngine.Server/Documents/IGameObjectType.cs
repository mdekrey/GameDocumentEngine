namespace GameDocumentEngine.Server.Documents;

public interface IGameObjectType
{
	string Name { get; }

	IReadOnlyList<string> PermissionLevels { get; }
	string DefaultPermissionLevel { get; }
	string CreatorPermissionLevel { get; }


	// TODO: Schema
	// TODO: Widgets/editor
}

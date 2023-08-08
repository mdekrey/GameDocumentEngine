namespace GameDocumentEngine.Server.Documents;

public class GamePermissionSetResolverFactory
{
	private readonly GameTypes gameTypes;

	public GamePermissionSetResolverFactory(GameTypes gameTypes)
	{
		this.gameTypes = gameTypes;
	}

	public GamePermissionSetResolver Create(Data.DocumentDbContext context) =>
		new(context, gameTypes);
}

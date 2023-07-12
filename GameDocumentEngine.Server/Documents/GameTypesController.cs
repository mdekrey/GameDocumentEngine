using GameDocumentEngine.Server.Api;

namespace GameDocumentEngine.Server.Documents;

public class GameTypesController : Api.GameTypeControllerBase
{
	private readonly IEnumerable<IGameType> gameTypes;

	public GameTypesController(IEnumerable<IGameType> gameTypes)
	{
		this.gameTypes = gameTypes;
	}

	protected override Task<ListGameTypesActionResult> ListGameTypes()
	{
		return Task.FromResult(ListGameTypesActionResult.Ok(this.gameTypes.Select(gt => new GameTypeSummary(
			Name: gt.Name,
			Description: gt.Description,
			ObjectTypes: gt.ObjectTypes.Select(o => o.Name)
		))));
	}
}

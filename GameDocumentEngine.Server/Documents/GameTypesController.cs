using GameDocumentEngine.Server.Api;

namespace GameDocumentEngine.Server.Documents;

public class GameTypesController : Api.GameTypeControllerBase
{
	private readonly GameTypes gameTypes;

	public GameTypesController(GameTypes gameTypes)
	{
		this.gameTypes = gameTypes;
	}

	protected override Task<ListGameTypesActionResult> ListGameTypes()
	{
		return Task.FromResult(ListGameTypesActionResult.Ok(this.gameTypes.All.Values.ToDictionary(gt => gt.Key, gt => new GameTypeSummary(
			Key: gt.Key,
			ObjectTypes: gt.ObjectTypes.Select(o => o.Key)
		))));
	}
}

using GameDocumentEngine.Server.Api;
using Json.Patch;

namespace GameDocumentEngine.Server.Documents;

public class GameController : Api.GameControllerBase
{
	protected override Task<CreateGameActionResult> CreateGame(EditableGameDetails createGameBody)
	{
		throw new NotImplementedException();
	}

	protected override Task<DeleteGameActionResult> DeleteGame(string gameId)
	{
		throw new NotImplementedException();
	}

	protected override Task<GetGameDetailsActionResult> GetGameDetails(string gameId)
	{
		throw new NotImplementedException();
	}

	protected override Task<PatchGameActionResult> PatchGame(string gameId, JsonPatch patchGameBody)
	{
		throw new NotImplementedException();
	}
}

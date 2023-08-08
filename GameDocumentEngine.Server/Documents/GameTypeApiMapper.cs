using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Tracing;
using static GameDocumentEngine.Server.Documents.GameSecurity;

namespace GameDocumentEngine.Server.Documents;

class GameTypeApiMapper : IApiMapper<IGameType, Api.GameTypeDetails>
{
	private readonly GameTypes gameTypes;

	public GameTypeApiMapper(GameTypes gameTypes)
	{
		this.gameTypes = gameTypes;
	}

	public async Task<GameTypeDetails> ToApi(DocumentDbContext dbContext, IGameType gameType)
	{
		using var activity = TracingHelper.StartActivity($"{nameof(GameTypeApiMapper)}.{nameof(ToApi)}");
		return new GameTypeDetails(
			Key: gameType.Key,
			UserRoles: GameRoles,
			ObjectTypes: await Task.WhenAll(
				gameType.ObjectTypes.Select(async obj => new GameObjectTypeDetails(
				Key: obj.Key,
					Scripts: (await Task.WhenAll(gameType.ObjectTypes.Select(gameTypes.ResolveGameObjectScripts))).SelectMany(a => a).Distinct(),
					// Game types could have different roles eventually; for now, we use a hard-coded set
					UserRoles: obj.PermissionLevels
				)))
		);
	}

	public Task<GameTypeDetails> ToApiBeforeChanges(DocumentDbContext dbContext, IGameType gameType) =>
		ToApi(dbContext, gameType);

	public object ToKey(IGameType entity) => entity.Key;
}

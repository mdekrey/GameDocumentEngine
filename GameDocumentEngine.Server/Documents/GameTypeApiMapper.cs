using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Tracing;
using Microsoft.Extensions.Caching.Memory;
using static GameDocumentEngine.Server.Documents.GameSecurity;

namespace GameDocumentEngine.Server.Documents;

class GameTypeApiMapper : IApiMapper<IGameType, Api.GameTypeDetails>
{
	private readonly GameTypes gameTypes;
	private readonly IMemoryCache memoryCache;

	public GameTypeApiMapper(GameTypes gameTypes, IMemoryCache memoryCache)
	{
		this.gameTypes = gameTypes;
		this.memoryCache = memoryCache;
	}

	public async Task<GameTypeDetails> ToApi(DocumentDbContext dbContext, IGameType gameType)
	{
		using var activity = TracingHelper.StartActivity($"{nameof(GameTypeApiMapper)}.{nameof(ToApi)}");
		return await GetGameTypeFromCache(gameType);
	}

	private async Task<GameTypeDetails> GetGameTypeFromCache(IGameType gameType)
	{
#if DEBUG
		return await CreateGameTypeDetails(gameType);
#else
		return await memoryCache.GetOrCreateAsync(new GameTypeKey(gameType.Key), async _ => await CreateGameTypeDetails(gameType)) ?? throw new InvalidOperationException("Could not load from cache");
#endif
	}

	private async Task<GameTypeDetails> CreateGameTypeDetails(IGameType gameType)
	{
		return new GameTypeDetails(
					Key: gameType.Key,
					UserRoles: gameType.Roles,
					ObjectTypes: await Task.WhenAll(
						gameType.ObjectTypes.Select(obj => GetGameObjectTypeFromCache(gameType, obj))
					)
				);
	}

	private async Task<GameObjectTypeDetails> GetGameObjectTypeFromCache(IGameType gameType, IGameObjectType obj)
	{
#if DEBUG
		return await CreateGameObjectTypeDetails(gameType, obj);
#else
		return await memoryCache.GetOrCreateAsync(new GameObjectTypeKey(obj.Key), async _ => await CreateGameObjectTypeDetails(gameType, obj))
										?? throw new InvalidOperationException("Could not load from cache");
#endif
	}

	private async Task<GameObjectTypeDetails> CreateGameObjectTypeDetails(IGameType gameType, IGameObjectType obj)
	{
		return new GameObjectTypeDetails(
								Key: obj.Key,
									Scripts: (await Task.WhenAll(gameType.ObjectTypes.Select(gameTypes.ResolveGameObjectScripts))).SelectMany(a => a).Distinct(),
									// Game types could have different roles eventually; for now, we use a hard-coded set
									UserRoles: obj.PermissionLevels
								);
	}

	public Task<GameTypeDetails> ToApiBeforeChanges(DocumentDbContext dbContext, IGameType gameType) =>
		ToApi(dbContext, gameType);

	public object ToKey(IGameType entity) => entity.Key;

	record GameTypeKey(string Key);
	record GameObjectTypeKey(string Key);
}

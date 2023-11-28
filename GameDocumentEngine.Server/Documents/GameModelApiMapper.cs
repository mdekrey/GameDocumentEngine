using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Security;
using GameDocumentEngine.Server.Tracing;
using GameDocumentEngine.Server.Users;
using Microsoft.EntityFrameworkCore;

namespace GameDocumentEngine.Server.Documents;

class GameModelApiMapper : IPermissionedApiMapper<GameModel, Api.GameDetails>
{
	private readonly GameTypes gameTypes;
	private readonly IApiMapper<IGameType, GameTypeDetails> gameTypeMapper;

	public GameModelApiMapper(GameTypes gameTypes, IApiMapper<IGameType, Api.GameTypeDetails> gameTypeMapper)
	{
		this.gameTypes = gameTypes;
		this.gameTypeMapper = gameTypeMapper;
	}

	public async Task<GameDetails> ToApi(DocumentDbContext dbContext, GameModel entity, PermissionSet permissionSet, DbContextChangeUsage usage)
	{
		using var activity = TracingHelper.StartActivity($"{nameof(GameModelApiMapper)}.{nameof(ToApi)}");
		var resultGame = dbContext.Entry(entity).AtState(usage);

		var gameUsers = dbContext
			.Entry(entity)
			.Collection(game => game.Players);
		// TODO: Consider not including user info in the Game. This causes us to load
		// a query instead of the collection. Also, we can't use these results because
		// it only includes active results.
		// Doing this does work some of the time; it helps with the LoadWithFixupAsync runs.
		if (!gameUsers.IsLoaded || gameUsers.Entries(dbContext).Any(gu => !gu.Reference(m => m.User).IsLoaded))
			await gameUsers.Query().Include(gu => gu.User).LoadAsync();

		var permissionEntries = dbContext.GetEntityEntries<GameUserModel>(gu => gu.GameId == entity.Id);

		var gameUserEntries = permissionEntries
			.AtStateEntries(usage);
		var userEntries = gameUserEntries
			.Select(e => e.Reference(gu => gu.User));

		// TODO: https://github.com/mdekrey/GameDocumentEngine/issues/1
		// I believe this was caused by an issue in EF Core. If an entity is
		// marked as "Deleted" but later has a query that loads a reference, that
		// referenced entity is added to the change tracker but not linked on the property.
		await userEntries.WhenAll(nav => nav.LoadWithFixupAsync());

		var users = userEntries
			.Select(e => e.TargetEntry ?? throw new InvalidOperationException("LoadWithFixup failed"))
			.AtState(usage)
			.ToArray();

		var typeInfo = gameTypes.All.TryGetValue(resultGame.Type, out var gameType)
			? await gameTypeMapper.ToApi(dbContext, gameType)
			: throw new NotSupportedException("Unknown game type");

		return ToApi(resultGame, gameUserEntries.AtState(usage), users, typeInfo, permissionSet);
	}

	private static GameDetails ToApi(GameModel game, GameUserModel[] gameUsers, UserModel[] users, GameTypeDetails typeInfo, PermissionSet permissionSet)
	{
		// "original values" game users won't have the 
		return new GameDetails(Name: game.Name,
					LastUpdated: game.LastModifiedDate,
					UserRoles: gameUsers.ToDictionary(
						p => p.UserId.ToString(),
						p => p.Role
					),
					PlayerNames: users.ToDictionary(
						p => p.Id.ToString(),
						p => p.Name
					),
					Id: game.Id,
					Version: game.Version,
					TypeInfo: typeInfo,
					Permissions: permissionSet.Permissions.Permissions
				);
	}

	public object ToKey(GameModel entity) => entity.Id;

}

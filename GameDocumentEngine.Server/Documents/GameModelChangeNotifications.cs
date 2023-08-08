using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Security;
using GameDocumentEngine.Server.Tracing;

namespace GameDocumentEngine.Server.Documents;

class GameModelChangeNotifications : PermissionedEntityChangeNotifications<GameModel, GameUserModel, Api.GameDetails>
{
	public GameModelChangeNotifications(
		IPermissionedApiMapper<GameModel, GameDetails> apiMapper,
		IApiChangeNotification<GameDetails> changeNotification)
		: base(apiMapper, changeNotification, du => du.UserId, du => du.Game)
	{
	}

	protected override async Task<IEnumerable<PermissionSet>> GetUsersFor(DocumentDbContext context, GameModel entity, DbContextChangeUsage changeState)
	{
		using var activity = TracingHelper.StartActivity($"{nameof(GameModelChangeNotifications)}.{nameof(GetUsersFor)}");
		var players = context.Entry(entity).Collection(d => d.Players);
		await players.LoadAsync();

		var gameUsers = await context.LoadEntityEntriesAsync<GameUserModel>(g => g.GameId == entity.Id);

		return gameUsers.AtState(changeState)
			.Select(GameSecurity.ToPermissionSet);
	}
}

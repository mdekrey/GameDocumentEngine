using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Security;
using GameDocumentEngine.Server.Tracing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace GameDocumentEngine.Server.Documents;

class GameModelChangeNotifications : PermissionedEntityChangeNotifications<GameModel, GameUserModel, Api.GameDetails>
{
	public GameModelChangeNotifications(
		IPermissionedApiMapper<GameModel, GameDetails> apiMapper,
		IApiChangeNotification<GameDetails> changeNotification)
		: base(apiMapper, changeNotification, du => du.UserId, du => du.Game)
	{
	}

	public override bool CanHandle(EntityEntry changedEntity)
	{
		return base.CanHandle(changedEntity) || changedEntity.Entity is Users.UserModel;
	}

	public override async Task<IEnumerable<EntityEntry>> GetBaseEntities(DocumentDbContext context, EntityEntry changedEntity)
	{
		if (changedEntity.Entity is Users.UserModel entity)
		{
			var entityReference = context.Entry(entity).Collection(user => user.Games);
			if (!entityReference.IsLoaded || context.ChangeTracker.Entries<GameUserModel>().Where(gu => gu.Entity.UserId == entity.Id).Any(gu => !gu.Reference(gameUser => gameUser.Game).IsLoaded))
			{
				await (from gameUser in context.GameUsers.Include(gu => gu.Game).ThenInclude(g => g.Players).ThenInclude(gu => gu.User)
					   where gameUser.UserId == entity.Id
					   select gameUser).LoadAsync();
			}
			var gameIds = (from guEntry in context.ChangeTracker.Entries<GameUserModel>()
						   where guEntry.Entity.UserId == entity.Id
						   select guEntry.Entity.GameId).ToArray();
			return context.ChangeTracker.Entries<GameModel>().Where(g => gameIds.Contains(g.Entity.Id)).ToArray();
		}
		return await base.GetBaseEntities(context, changedEntity);
	}

	protected override async Task<GameModel> LoadTargetEntity(DocumentDbContext context, GameUserModel userEntity)
	{
		if (userEntity.Game != null) return userEntity.Game;
		return context.ChangeTracker.Entries<GameModel>().FirstOrDefault(d => d.Entity.Id == userEntity.GameId)?.Entity
			?? await context.Games.Include(g => g.Players).ThenInclude(gu => gu.User).SingleAsync(g => g.Id == userEntity.GameId);
	}

	protected override async Task<IEnumerable<PermissionSet>> GetUsersFor(DocumentDbContext context, GameModel entity, DbContextChangeUsage changeState)
	{
		using var activity = TracingHelper.StartActivity($"{nameof(GameModelChangeNotifications)}.{nameof(GetUsersFor)}");
		var players = context.Entry(entity).Collection(d => d.Players);
		if (!players.IsLoaded) await players.LoadAsync();

		var gameUsers = context.GetEntityEntries<GameUserModel>(g => g.GameId == entity.Id);

		return gameUsers.AtState(changeState)
			.Select(GameSecurity.ToPermissionSet);
	}
}

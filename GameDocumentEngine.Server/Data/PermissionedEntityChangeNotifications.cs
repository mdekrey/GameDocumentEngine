using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Security;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Linq.Expressions;

namespace GameDocumentEngine.Server.Data;

abstract class PermissionedEntityChangeNotifications<TEntity, TUserEntity, TApi> : IEntityChangeNotifications
	where TEntity : class
	where TUserEntity : class
{
	protected readonly IPermissionedApiMapper<TEntity, TApi> apiMapper;
	private readonly IApiChangeNotification<TApi> changeNotification;
	private readonly Func<TUserEntity, Guid> toUserId;
	private readonly Expression<Func<TUserEntity, TEntity?>> toEntity;

	public PermissionedEntityChangeNotifications(
		IPermissionedApiMapper<TEntity, TApi> apiMapper,
		IApiChangeNotification<TApi> changeNotification,
		Func<TUserEntity, Guid> toUserId,
		Expression<Func<TUserEntity, TEntity?>> toEntity)
	{
		this.apiMapper = apiMapper;
		this.changeNotification = changeNotification;
		this.toUserId = toUserId;
		this.toEntity = toEntity;
	}

	public virtual bool CanHandle(EntityEntry changedEntity) => changedEntity.Entity is TEntity or TUserEntity;

	public virtual async Task SendNotification(Data.DocumentDbContext context, IHubClients clients, EntityEntry changedEntity)
	{
		if (changedEntity.Entity is TEntity entity) await SendEntityNotification(context, context.Entry(entity));
		if (changedEntity.Entity is TUserEntity userEntity) await SendUserChangedNotification(context, context.Entry(userEntity));
	}


	protected virtual async Task SendEntityNotification(DocumentDbContext context, EntityEntry<TEntity> changedEntity)
	{
		var entity = changedEntity.Entity;
		if (changedEntity.State != EntityState.Modified) return;

		var userPermissions = await GetUsersFor(context, entity, DbContextChangeUsage.AfterChange);

		foreach (var user in userPermissions)
			await changeNotification.SendModifiedNotification(
				apiMapper.ToKey(entity),
				await apiMapper.ToApi(context, entity, user, DbContextChangeUsage.BeforeChange),
				await apiMapper.ToApi(context, entity, user, DbContextChangeUsage.AfterChange),
				user.GameUser.UserId);
	}
	protected virtual async Task SendUserChangedNotification(DocumentDbContext context, EntityEntry<TUserEntity> changedEntity)
	{
		var target = changedEntity.Entity;
		if (target == null)
			return;
		var entityReference = context.Entry(target).Reference(toEntity);
		await entityReference.LoadAsync();
		var entityEntry = entityReference.TargetEntry
			?? throw new InvalidOperationException("Could not resolve reference to entity");
		var entity = entityEntry.Entity;

		var oldUserPermissions = await GetUsersFor(context, entity, DbContextChangeUsage.BeforeChange);
		var newUserPermissions = await GetUsersFor(context, entity, DbContextChangeUsage.AfterChange);

		var currentUserId = toUserId(target);
		var currentUser = new
		{
			Old = oldUserPermissions.FirstOrDefault(p => p.GameUser.UserId == currentUserId),
			New = newUserPermissions.FirstOrDefault(p => p.GameUser.UserId == currentUserId),
		};
		var otherUsers = newUserPermissions.Where(p => p.GameUser.UserId != currentUserId);

		// treat removing the `target` as deleting the document, adding the 'target' as creating the document, and broadcast changes to others on the document
		var key = apiMapper.ToKey(entity);
		if (currentUser.Old != null && currentUser.New == null)
			await changeNotification.SendDeletedNotification(key, currentUserId);
		else if (currentUser.Old == null && currentUser.New != null)
			await changeNotification.SendAddedNotification(
				key,
				await apiMapper.ToApi(context, entity, currentUser.New, DbContextChangeUsage.AfterChange),
				currentUserId
			);
		else if (currentUser.Old != null && currentUser.New != null)
		{
			await changeNotification.SendModifiedNotification(
				key,
				await apiMapper.ToApi(context, entity, currentUser.Old, DbContextChangeUsage.BeforeChange),
				await apiMapper.ToApi(context, entity, currentUser.New, DbContextChangeUsage.AfterChange),
				currentUserId
			);
		}

		foreach (var user in otherUsers)
		{
			var oldPermissions = oldUserPermissions.FirstOrDefault(p => p.GameUser.UserId == user.GameUser.UserId) ?? user;
			await changeNotification.SendModifiedNotification(
				key,
				await apiMapper.ToApi(context, entity, oldPermissions, DbContextChangeUsage.BeforeChange),
				await apiMapper.ToApi(context, entity, user, DbContextChangeUsage.AfterChange),
				user.GameUser.UserId
			);
		}
	}

	protected abstract Task<IEnumerable<PermissionSet>> GetUsersFor(DocumentDbContext context, TEntity entity, DbContextChangeUsage changeState);
}

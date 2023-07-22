using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Documents;
using GameDocumentEngine.Server.Security;
using Json.Patch;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Linq.Expressions;
using System.Text.Json;

namespace GameDocumentEngine.Server.Data;

abstract class EntityChangeNotifications<TEntity, TApi> : IEntityChangeNotifications where TEntity : class
{
	protected readonly IApiMapper<TEntity, TApi> apiMapper;
	private readonly IApiChangeNotification<TApi> changeNotification;

	public EntityChangeNotifications(
		IApiMapper<TEntity, TApi> apiMapper,
		IApiChangeNotification<TApi> changeNotification)
	{
		this.apiMapper = apiMapper;
		this.changeNotification = changeNotification;
	}

	public virtual bool CanHandle(EntityEntry changedEntity) => changedEntity.Entity is TEntity;

	public virtual async Task SendNotification(Data.DocumentDbContext context, IHubClients clients, EntityEntry changedEntity)
	{
		if (changedEntity.Entity is not TEntity entity) return;
		var users = await GetUsersFor(context, entity);
		var key = apiMapper.ToKey(entity);
		switch (changedEntity.State)
		{
			case Microsoft.EntityFrameworkCore.EntityState.Added:
				{
					var api = await apiMapper.ToApi(context, entity);
					foreach (var user in users)
						await changeNotification.SendAddedNotification(key, api, user);
				}
				return;

			case Microsoft.EntityFrameworkCore.EntityState.Deleted:
				{
					foreach (var user in users)
						await changeNotification.SendDeletedNotification(key, user);
				}
				return;

			case Microsoft.EntityFrameworkCore.EntityState.Modified:
				{
					var oldApi = await apiMapper.ToApiBeforeChanges(context, entity);
					var api = await apiMapper.ToApi(context, entity);
					foreach (var user in users)
						await changeNotification.SendModifiedNotification(key, oldApi, api, user);
				}
				return;
		}
	}

	protected abstract Task<IEnumerable<Guid>> GetUsersFor(DocumentDbContext context, TEntity entity);
}

public enum DbContextChangeUsage
{
	BeforeChange,
	AfterChange,
}

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
				await apiMapper.ToApiBeforeChanges(
					context,
					changedEntity.Entity,
					user),
				await apiMapper.ToApi(context, entity, user),
				user.UserId);
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
			Old = oldUserPermissions.FirstOrDefault(p => p.UserId == currentUserId),
			New = newUserPermissions.FirstOrDefault(p => p.UserId == currentUserId),
		};
		var otherUsers = newUserPermissions.Where(p => p.UserId != currentUserId);

		// treat removing the `target` as deleting the document, adding the 'target' as creating the document, and broadcast changes to others on the document
		var key = apiMapper.ToKey(entity);
		if (currentUser.Old != null && currentUser.New == null)
			await changeNotification.SendDeletedNotification(key, currentUserId);
		else if (currentUser.Old == null && currentUser.New != null)
			await changeNotification.SendAddedNotification(
				key,
				await apiMapper.ToApi(context, entity, currentUser.New),
				currentUserId
			);
		else if (currentUser.Old != null && currentUser.New != null)
		{
			await changeNotification.SendModifiedNotification(
				key,
				await apiMapper.ToApiBeforeChanges(context, entity, currentUser.Old),
				await apiMapper.ToApi(context, entity, currentUser.New),
				currentUserId
			);
		}

		foreach (var user in otherUsers)
		{
			await changeNotification.SendModifiedNotification(
				key,
				await apiMapper.ToApiBeforeChanges(context, entity, oldUserPermissions.FirstOrDefault(p => p.UserId == user.UserId) ?? user),
				await apiMapper.ToApi(context, entity, user),
				user.UserId
			);
		}
	}

	protected abstract Task<IEnumerable<PermissionSet>> GetUsersFor(DocumentDbContext context, TEntity entity, DbContextChangeUsage changeState);
}

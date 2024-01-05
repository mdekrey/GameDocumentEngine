using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Security;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using PrincipleStudios.OpenApiCodegen.Json.Extensions;
using System.Linq.Expressions;

namespace GameDocumentEngine.Server.Data;

abstract class PermissionedEntityChangeNotifications<TEntity, TUserEntity, TApi> : IEntityChangeNotifications, IApiChangeDetector
	where TEntity : class
	where TUserEntity : class
{
	protected readonly IPermissionedApiMapper<TEntity, TApi> apiMapper;
	private readonly IApiChangeNotification<TApi> changeNotification;

	public PermissionedEntityChangeNotifications(
		IPermissionedApiMapper<TEntity, TApi> apiMapper,
		IApiChangeNotification<TApi> changeNotification)
	{
		this.apiMapper = apiMapper;
		this.changeNotification = changeNotification;
	}

	public virtual bool CanHandle(EntityEntry changedEntity) => changedEntity.Entity is TEntity or TUserEntity;

	public virtual async Task<IEnumerable<EntityEntry>> GetBaseEntities(DocumentDbContext context, EntityEntry changedEntity)
	{
		if (changedEntity.Entity is TEntity) return new[] { changedEntity };
		if (changedEntity.Entity is TUserEntity userEntity)
		{
			var targetEntity = await LoadTargetEntity(context, userEntity);
			return new[] { context.Entry(targetEntity) };
		}
		return Enumerable.Empty<EntityEntry>();
	}

	protected abstract Task<TEntity> LoadTargetEntity(DocumentDbContext context, TUserEntity userEntity);

	public virtual async Task SendNotification(Data.DocumentDbContext context, IHubClients clients, EntityEntry changedEntity)
	{
		if (changedEntity.Entity is TEntity entity) await SendEntityNotification(context, context.Entry(entity));
	}

	protected virtual async Task SendEntityNotification(DocumentDbContext context, EntityEntry<TEntity> changedEntity)
	{
		var entity = changedEntity.Entity;

		var oldUserPermissions = changedEntity.State == EntityState.Added
			? Enumerable.Empty<PermissionSet>()
			: await GetUsersFor(context, entity, DbContextChangeUsage.BeforeChange);
		var newUserPermissions = changedEntity.State == EntityState.Deleted
			? Enumerable.Empty<PermissionSet>()
			: await GetUsersFor(context, entity, DbContextChangeUsage.AfterChange);

		foreach (var nullableUserId in oldUserPermissions.Select(p => p.GameUser.UserId).Union(newUserPermissions.Select(p => p.GameUser.UserId)))
		{
			if (nullableUserId is not Guid userId) continue;

			var oldValue = oldUserPermissions.FirstOrDefault(p => p.GameUser.UserId == userId) is PermissionSet oldPermission
			  ? Optional.Create(await apiMapper.ToApi(context, entity, oldPermission, DbContextChangeUsage.BeforeChange))
			  : null;
			var newValue = newUserPermissions.FirstOrDefault(p => p.GameUser.UserId == userId) is PermissionSet newPermission
			  ? Optional.Create(await apiMapper.ToApi(context, entity, newPermission, DbContextChangeUsage.AfterChange))
			  : null;

			await changeNotification.SendNotification(
				apiMapper.ToKey(entity),
				oldValue,
				newValue,
				userId);
		}
	}

	protected abstract Task<IEnumerable<PermissionSet>> GetUsersFor(DocumentDbContext context, TEntity entity, DbContextChangeUsage changeState);
}

using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Documents;
using Json.Patch;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Text.Json;

namespace GameDocumentEngine.Server.Data;

abstract class EntityChangeNotifications<TEntity, TApi> : IApiChangeDetector, IEntityChangeNotifications where TEntity : class
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

	public Task<IEnumerable<EntityEntry>> GetBaseEntities(DocumentDbContext context, EntityEntry changedEntity)
	{
		if (changedEntity.Entity is TEntity) return Task.FromResult<IEnumerable<EntityEntry>>(new[] { changedEntity });
		return Task.FromResult(Enumerable.Empty<EntityEntry>());
	}

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

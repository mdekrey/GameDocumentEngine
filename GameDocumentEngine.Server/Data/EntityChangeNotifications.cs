using GameDocumentEngine.Server.Api;
using Json.Patch;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Text.Json;

namespace GameDocumentEngine.Server.Data;

abstract class EntityChangeNotifications<TEntity, TApi> : IEntityChangeNotifications where TEntity : class
{
	protected readonly IApiMapper<TEntity, TApi> apiMapper;

	public EntityChangeNotifications(IApiMapper<TEntity, TApi> apiMapper)
	{
		this.apiMapper = apiMapper;
	}

	public virtual bool CanHandle(EntityEntry changedEntity) => changedEntity.Entity is TEntity;

	public virtual ValueTask SendNotification(Data.DocumentDbContext context, IHubClients clients, EntityEntry changedEntity)
	{
		if (changedEntity.Entity is not TEntity) return ValueTask.CompletedTask;
		switch (changedEntity.State)
		{
			case Microsoft.EntityFrameworkCore.EntityState.Added when HasAddedMessage:
				return SendAddedNotification(context, clients, changedEntity);
			case Microsoft.EntityFrameworkCore.EntityState.Deleted when HasDeletedMessage:
				return SendDeletedNotification(context, clients, changedEntity);
			case Microsoft.EntityFrameworkCore.EntityState.Modified when HasModifiedMessage:
				return SendModifiedNotification(context, clients, changedEntity);
			default:
				return ValueTask.CompletedTask;
		}
	}

	protected virtual async ValueTask SendAddedNotification(Data.DocumentDbContext context, IHubClients clients, EntityEntry changedEntity)
	{
		var result = changedEntity.Entity as TEntity;
		if (result == null)
		{
			await Task.Yield();
			throw new InvalidOperationException("Could not cast result entity");
		}

		var key = apiMapper.ToKey(result);
		var value = await apiMapper.ToApi(context, result);
		await SendAddedMessage(context, clients, result, new { key, value });
	}

	protected virtual async ValueTask SendDeletedNotification(Data.DocumentDbContext context, IHubClients clients, EntityEntry changedEntity)
	{
		var original = changedEntity.OriginalValues.Clone().ToObject() as TEntity;
		if (original == null)
		{
			await Task.Yield();
			throw new InvalidOperationException("Could not create original entity from modified");
		}

		var key = apiMapper.ToKey(original);
		await SendDeletedMessage(context, clients, original, new { key });
	}

	protected virtual async ValueTask SendModifiedNotification(Data.DocumentDbContext context, IHubClients clients, EntityEntry changedEntity)
	{
		var original = changedEntity.OriginalValues.Clone().ToObject() as TEntity;
		if (original == null)
		{
			await Task.Yield();
			throw new InvalidOperationException("Could not create original entity from modified");
		}
		var result = changedEntity.Entity as TEntity;
		if (result == null)
		{
			await Task.Yield();
			throw new InvalidOperationException("Could not cast result entity");
		}

		var originalNode = JsonSerializer.SerializeToNode(await apiMapper.ToApi(context, original));
		var resultNode = JsonSerializer.SerializeToNode(await apiMapper.ToApi(context, result));

		var patch = PatchExtensions.CreatePatch(originalNode, resultNode);
		var key = apiMapper.ToKey(original);

		// TODO - check to see if patch is larger than value; if so, just send value

		await SendModifiedMessage(context, clients, original, new { key, patch });
	}

	protected virtual bool HasModifiedMessage => true;
	protected virtual bool HasAddedMessage => true;
	protected virtual bool HasDeletedMessage => true;
	protected abstract Task SendAddedMessage(Data.DocumentDbContext context, IHubClients clients, TEntity result, object message);
	protected abstract Task SendDeletedMessage(Data.DocumentDbContext context, IHubClients clients, TEntity original, object message);
	protected abstract Task SendModifiedMessage(Data.DocumentDbContext context, IHubClients clients, TEntity original, object message);
}

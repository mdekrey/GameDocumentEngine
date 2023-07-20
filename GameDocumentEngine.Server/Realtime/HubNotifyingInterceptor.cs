using GameDocumentEngine.Server.Users;
using Json.Patch;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace GameDocumentEngine.Server.Realtime;

interface IEntityChangeNotifications
{
	bool CanHandle(EntityEntry changedEntity);
	ValueTask SendNotification(Data.DocumentDbContext context, IHubClients clients, EntityEntry changedEntity);
}

abstract class EntityChangeNotifications<TEntity, TApi> : IEntityChangeNotifications where TEntity : class
{
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

		var key = ToKey(result);
		var value = await ToApi(result);
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

		var key = ToKey(original);
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

		var originalNode = JsonSerializer.SerializeToNode(await ToApi(original));
		var resultNode = JsonSerializer.SerializeToNode(await ToApi(result));

		var patch = PatchExtensions.CreatePatch(originalNode, resultNode);
		var key = ToKey(original);

		// TODO - check to see if patch is larger than value; if so, just send value

		await SendModifiedMessage(context, clients, original, new { key, patch });
	}

	protected abstract object ToKey(TEntity entity);
	protected abstract Task<TApi> ToApi(TEntity entity);
	protected virtual bool HasModifiedMessage => true;
	protected virtual bool HasAddedMessage => true;
	protected virtual bool HasDeletedMessage => true;
	protected abstract Task SendAddedMessage(Data.DocumentDbContext context, IHubClients clients, TEntity result, object message);
	protected abstract Task SendDeletedMessage(Data.DocumentDbContext context, IHubClients clients, TEntity original, object message);
	protected abstract Task SendModifiedMessage(Data.DocumentDbContext context, IHubClients clients, TEntity original, object message);
}

class HubNotifyingInterceptor : ISaveChangesInterceptor
{
	private readonly IHubContext<GameDocumentsHub> hubContext;
	private readonly IEnumerable<IEntityChangeNotifications> entityChangeNotifiers;

	public HubNotifyingInterceptor(IHubContext<GameDocumentsHub> hubContext, IEnumerable<IEntityChangeNotifications> entityChangeNotifiers)
	{
		this.hubContext = hubContext;
		this.entityChangeNotifiers = entityChangeNotifiers;
	}


	public async ValueTask<InterceptionResult<int>> SavingChangesAsync(
		DbContextEventData eventData,
		InterceptionResult<int> result,
		CancellationToken cancellationToken = default)
	{
		if (eventData.Context is not Data.DocumentDbContext context) return result;

		foreach (var changedEntity in context.ChangeTracker.Entries())
		{
			if (changedEntity.State == Microsoft.EntityFrameworkCore.EntityState.Unchanged) continue;

			var notifications = entityChangeNotifiers.FirstOrDefault(c => c.CanHandle(changedEntity));
			if (notifications != null)
				await notifications.SendNotification(context, hubContext.Clients, changedEntity);
		}

		return result;
	}
}
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
	ValueTask SendChangeNotification(MessageIdProvider messageIdProvider, IHubClients clients, EntityEntry changedEntity);
}

interface IEntityChangeNotifications<T> : IEntityChangeNotifications where T : class
{
	bool IEntityChangeNotifications.CanHandle(EntityEntry changedEntity) => changedEntity.Entity is T;
}

abstract class EntityChangeNotifications<TEntity, TApi> : IEntityChangeNotifications<TEntity> where TEntity : class
{
	public virtual ValueTask SendChangeNotification(MessageIdProvider messageIdProvider, IHubClients clients, EntityEntry changedEntity)
	{
		switch (changedEntity.State)
		{
			case Microsoft.EntityFrameworkCore.EntityState.Added when HasAddedMessage:
				return SendAddedNotification(messageIdProvider, clients, changedEntity);
			case Microsoft.EntityFrameworkCore.EntityState.Deleted when HasDeletedMessage:
				return SendDeletedNotification(messageIdProvider, clients, changedEntity);
			case Microsoft.EntityFrameworkCore.EntityState.Modified when HasModifiedMessage:
				return SendModifiedNotification(messageIdProvider, clients, changedEntity);
			default:
				return ValueTask.CompletedTask;
		}
	}

	protected virtual async ValueTask SendAddedNotification(MessageIdProvider messageIdProvider, IHubClients clients, EntityEntry changedEntity)
	{
		var result = changedEntity.Entity as TEntity;
		if (result == null)
		{
			await Task.Yield();
			throw new InvalidOperationException("Could not cast result entity");
		}

		var key = ToKey(result);
		var value = await ToApi(result);
		messageIdProvider.Defer((messageId) => SendAddedMessage(clients, result, new { messageId, key, value }));
	}

	protected virtual async ValueTask SendDeletedNotification(MessageIdProvider messageIdProvider, IHubClients clients, EntityEntry changedEntity)
	{
		var original = changedEntity.OriginalValues.Clone().ToObject() as TEntity;
		if (original == null)
		{
			await Task.Yield();
			throw new InvalidOperationException("Could not create original entity from modified");
		}

		var key = ToKey(original);
		messageIdProvider.Defer((messageId) => SendDeletedMessage(clients, original, new { messageId, key }));
	}

	protected virtual async ValueTask SendModifiedNotification(MessageIdProvider messageIdProvider, IHubClients clients, EntityEntry changedEntity)
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

		messageIdProvider.Defer((messageId) => SendModifiedMessage(clients, original, new { messageId, key, patch }));
	}

	protected abstract object ToKey(TEntity entity);
	protected abstract Task<TApi> ToApi(TEntity entity);
	protected virtual bool HasModifiedMessage => true;
	protected virtual bool HasAddedMessage => true;
	protected virtual bool HasDeletedMessage => true;
	protected abstract Task SendAddedMessage(IHubClients clients, TEntity result, object message);
	protected abstract Task SendDeletedMessage(IHubClients clients, TEntity original, object message);
	protected abstract Task SendModifiedMessage(IHubClients clients, TEntity original, object message);
}

class HubNotifyingInterceptor : ISaveChangesInterceptor
{
	private readonly IHubContext<GameDocumentsHub> hubContext;
	private readonly MessageIdProvider messageIdProvider;
	private readonly IEnumerable<IEntityChangeNotifications> entityChangeNotifiers;

	public HubNotifyingInterceptor(IHubContext<GameDocumentsHub> hubContext, MessageIdProvider messageIdProvider, IEnumerable<IEntityChangeNotifications> entityChangeNotifiers)
	{
		this.hubContext = hubContext;
		this.messageIdProvider = messageIdProvider;
		this.entityChangeNotifiers = entityChangeNotifiers;
	}


	public async ValueTask<InterceptionResult<int>> SavingChangesAsync(
		DbContextEventData eventData,
		InterceptionResult<int> result,
		CancellationToken cancellationToken = default)
	{
		var context = eventData.Context;
		if (context == null) return result;

		foreach (var changedEntity in context.ChangeTracker.Entries())
		{
			if (changedEntity.State == Microsoft.EntityFrameworkCore.EntityState.Unchanged) continue;

			var notifications = entityChangeNotifiers.FirstOrDefault(c => c.CanHandle(changedEntity));
			if (notifications != null)
				await notifications.SendChangeNotification(messageIdProvider, hubContext.Clients, changedEntity);
		}

		return result;
	}
}
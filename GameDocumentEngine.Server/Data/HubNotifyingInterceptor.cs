using GameDocumentEngine.Server.Documents;
using GameDocumentEngine.Server.Realtime;
using GameDocumentEngine.Server.Tracing;
using GameDocumentEngine.Server.Users;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.ChangeTracking.Internal;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.Diagnostics;
using System.Linq;

namespace GameDocumentEngine.Server.Data;

class HubNotifyingInterceptor : ISaveChangesInterceptor
{
	private readonly IHubContext<GameDocumentsHub> hubContext;
	private readonly IEnumerable<IApiChangeDetector> apiChangeDetectors;
	private readonly IEnumerable<IEntityChangeNotifications> entityChangeNotifiers;

	public HubNotifyingInterceptor(IHubContext<GameDocumentsHub> hubContext, IEnumerable<IApiChangeDetector> apiChangeDetectors, IEnumerable<IEntityChangeNotifications> entityChangeNotifiers)
	{
		this.hubContext = hubContext;
		this.apiChangeDetectors = apiChangeDetectors;
		this.entityChangeNotifiers = entityChangeNotifiers;
	}


	public async ValueTask<InterceptionResult<int>> SavingChangesAsync(
		DbContextEventData eventData,
		InterceptionResult<int> result,
		CancellationToken cancellationToken = default)
	{
		if (eventData.Context is not Data.DocumentDbContext context) return result;
		await NotifyChangesAsync(context);

		return result;
	}

	private async Task NotifyChangesAsync(DocumentDbContext context)
	{
		using Activity? activity = TracingHelper.StartActivity(nameof(NotifyChangesAsync));

		var allBaseEntities = await GetEntitiesToNotify(context);
		await NotifyEntitiesChanged(context, allBaseEntities);
	}

	private async Task<IEnumerable<EntityEntry>> GetEntitiesToNotify(DocumentDbContext context)
	{
		using Activity? activity = TracingHelper.StartActivity(nameof(GetEntitiesToNotify));
		return await (from changedEntity in context.ChangeTracker.Entries().ToArray()
					  where changedEntity.State != Microsoft.EntityFrameworkCore.EntityState.Unchanged
					  from changeDetector in apiChangeDetectors
					  where changeDetector.CanHandle(changedEntity)
					  select (changeDetector, changedEntity)).WhenAll((tuple) => tuple.changeDetector.GetBaseEntities(context, tuple.changedEntity))
									   .SelectMany(e => e.ToAsyncEnumerable()).ToArrayAsync();
	}

	private async Task NotifyEntitiesChanged(DocumentDbContext context, IEnumerable<EntityEntry> allBaseEntities)
	{
		using Activity? activity = TracingHelper.StartActivity(nameof(NotifyEntitiesChanged));
		// Note that this assumes nothing in the notifications will change state.
		// It also assumes saving changes succeeds.
		// TODO: If saving changes may fail, record notifications and send after success.
		foreach (var (changedEntity, notifications) in from changedEntity in allBaseEntities.Distinct()
													   let notifications = entityChangeNotifiers.FirstOrDefault(c => c.CanHandle(changedEntity))
													   where notifications != null
													   select (changedEntity, notifications))
		{
			await notifications.SendNotification(context, hubContext.Clients, changedEntity);
		}
	}
}
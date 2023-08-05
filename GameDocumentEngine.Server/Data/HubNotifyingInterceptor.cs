using GameDocumentEngine.Server.Documents;
using GameDocumentEngine.Server.Realtime;
using GameDocumentEngine.Server.Tracing;
using GameDocumentEngine.Server.Users;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Diagnostics;
using System.Text.Json.Nodes;

namespace GameDocumentEngine.Server.Data;

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
		await NotifyChangesAsync(context);

		return result;
	}

	private async Task NotifyChangesAsync(DocumentDbContext context)
	{
		using Activity? activity = TracingHelper.StartActivity(nameof(NotifyChangesAsync));

		// Note that this assumes nothing in the notifications will change state.
		foreach (var changedEntity in context.ChangeTracker.Entries().ToArray())
		{
			if (changedEntity.State == Microsoft.EntityFrameworkCore.EntityState.Unchanged) continue;

			var notifications = entityChangeNotifiers.FirstOrDefault(c => c.CanHandle(changedEntity));
			if (notifications != null)
				await notifications.SendNotification(context, hubContext.Clients, changedEntity);
		}
	}
}
using GameDocumentEngine.Server.Realtime;
using GameDocumentEngine.Server.Users;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
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
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace GameDocumentEngine.Server.Data;

interface IEntityChangeNotifications
{
	bool CanHandle(EntityEntry changedEntity);
	Task SendNotification(Data.DocumentDbContext context, IHubClients clients, EntityEntry changedEntity);
}

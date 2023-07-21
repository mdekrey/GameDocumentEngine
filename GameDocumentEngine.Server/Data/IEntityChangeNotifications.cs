using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace GameDocumentEngine.Server.Data;

interface IEntityChangeNotifications
{
	bool CanHandle(EntityEntry changedEntity);
	ValueTask SendNotification(Data.DocumentDbContext context, IHubClients clients, EntityEntry changedEntity);
}

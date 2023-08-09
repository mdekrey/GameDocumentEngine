using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace GameDocumentEngine.Server.Data;

interface IApiChangeDetector
{
	bool CanHandle(EntityEntry changedEntity);
	Task<IEnumerable<EntityEntry>> GetBaseEntities(Data.DocumentDbContext context, EntityEntry changedEntity);
}

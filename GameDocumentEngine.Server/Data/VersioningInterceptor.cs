using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Security.Claims;

namespace GameDocumentEngine.Server.Data;

class VersioningInterceptor : ISaveChangesInterceptor
{
	public ValueTask<InterceptionResult<int>> SavingChangesAsync(
		DbContextEventData eventData,
		InterceptionResult<int> result,
		CancellationToken cancellationToken = default)
	{
		var context = eventData.Context;
		if (context == null) return new(result);

		foreach (var changedEntity in context.ChangeTracker.Entries())
		{
			if (changedEntity.Entity is IOperationalTransformed entity)
			{
				switch (changedEntity.State)
				{
					case EntityState.Added:
						context.Entry(entity).Property(x => x.Version).CurrentValue = Guid.NewGuid();
						break;
					case EntityState.Modified:
						context.Entry(entity).Property(x => x.Version).CurrentValue = Guid.NewGuid();
						break;
				}
			}
		}

		return new(result);
	}
}

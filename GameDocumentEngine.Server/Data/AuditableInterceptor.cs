using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Security.Claims;

namespace GameDocumentEngine.Server.Data;

class AuditableInterceptor : ISaveChangesInterceptor
{
	private readonly IHttpContextAccessor? httpContextAccessor;

	public AuditableInterceptor(IHttpContextAccessor httpContextAccessor)
	{
		this.httpContextAccessor = httpContextAccessor;
	}

	public ValueTask<InterceptionResult<int>> SavingChangesAsync(
		DbContextEventData eventData,
		InterceptionResult<int> result,
		CancellationToken cancellationToken = default)
	{
		var currentUsername = this.httpContextAccessor?.HttpContext?.User.FindFirst(c => c.Type == ClaimTypes.Email)?.Value;
		var now = DateTimeOffset.UtcNow;

		var context = eventData.Context;
		if (context == null) return new(result);

		foreach (var changedEntity in context.ChangeTracker.Entries())
		{
			if (changedEntity.Entity is IAuditable entity)
			{
				switch (changedEntity.State)
				{
					case EntityState.Added:
						context.Entry(entity).Property(x => x.CreatedDate).CurrentValue = now;
						context.Entry(entity).Property(x => x.LastModifiedDate).CurrentValue = now;
						context.Entry(entity).Property(x => x.CreatedBy).CurrentValue = currentUsername;
						context.Entry(entity).Property(x => x.LastModifiedBy).CurrentValue = currentUsername;
						break;
					case EntityState.Modified:
						context.Entry(entity).Property(x => x.CreatedBy).IsModified = false;
						context.Entry(entity).Property(x => x.CreatedDate).IsModified = false;
						context.Entry(entity).Property(x => x.LastModifiedDate).CurrentValue = now;
						context.Entry(entity).Property(x => x.LastModifiedBy).CurrentValue = currentUsername;
						break;
				}
			}
		}

		return new(result);
	}
}

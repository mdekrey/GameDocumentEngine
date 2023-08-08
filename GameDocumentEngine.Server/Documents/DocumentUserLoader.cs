using GameDocumentEngine.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace GameDocumentEngine.Server.Documents;

class DocumentUserLoader
{
	private readonly ISet<DocumentModel> documentsWithLoadedUsers = new HashSet<DocumentModel>();

	public ValueTask EnsureDocumentUsersLoaded(DocumentDbContext dbContext, DocumentModel entity)
	{
		if (documentsWithLoadedUsers.Contains(entity)) return ValueTask.CompletedTask;
		return new ValueTask(LoadDocumentUsers(dbContext, entity));
	}

	private async Task LoadDocumentUsers(DocumentDbContext dbContext, DocumentModel entity)
	{
		await (from gameUser in dbContext.GameUsers
				.Include(gu => from documentUser in gu.Documents
							   where documentUser.DocumentId == entity.Id
							   select documentUser)
			   where gameUser.GameId == entity.GameId
			   select gameUser).LoadAsync();
		documentsWithLoadedUsers.Add(entity);
	}
}

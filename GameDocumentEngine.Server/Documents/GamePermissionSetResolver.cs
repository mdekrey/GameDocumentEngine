using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Security;
using Microsoft.EntityFrameworkCore;

namespace GameDocumentEngine.Server.Documents;

public class GamePermissionSetResolver
{
	private readonly DocumentDbContext context;

	public GamePermissionSetResolver(Data.DocumentDbContext context)
	{
		this.context = context;
	}

	public async Task<PermissionSet?> GetPermissions(Guid userId, Guid gameId)
	{
		var gameUserRecord = await (from gameUser in context.GameUsers
									where gameUser.UserId == userId && gameUser.GameId == gameId
									select gameUser).SingleOrDefaultAsync();
		if (gameUserRecord == null) return null;
		return new PermissionSet(userId, gameUserRecord.ToPermissions());
	}
}
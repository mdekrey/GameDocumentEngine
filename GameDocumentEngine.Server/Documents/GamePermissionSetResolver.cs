using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Security;
using GameDocumentEngine.Server.Users;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.CodeAnalysis;
using System.Security.Claims;

namespace GameDocumentEngine.Server.Documents;

public class GamePermissionSetResolver
{
	private readonly DocumentDbContext context;
	private readonly GameTypes gameTypes;

	public GamePermissionSetResolver(Data.DocumentDbContext context, GameTypes gameTypes)
	{
		this.context = context;
		this.gameTypes = gameTypes;
	}

	public async Task<PermissionSet?> GetPermissions(Guid userId, Guid gameId)
	{
		var gameUserRecord = await (from gameUser in context.GameUsers
									where gameUser.UserId == userId && gameUser.GameId == gameId
									select gameUser).SingleOrDefaultAsync();
		if (gameUserRecord == null) return null;
		return gameUserRecord.ToPermissionSet();
	}

	public async Task<PermissionSet?> GetPermissions(Guid userId, Guid gameId, Guid documentId)
	{
		var userPermissions = await GetPermissions(userId, gameId);
		if (userPermissions == null) return null;
		var documentPermissions = await GetDocumentPermissions();

		if (documentPermissions == null && !userPermissions.Permissions.HasPermission(GameSecurity.SeeAnyDocument(gameId)))
			return null;

		if (documentPermissions == null)
			return userPermissions;

		return userPermissions with { Permissions = userPermissions.Permissions.Add(documentPermissions) };

		async Task<PermissionList?> GetDocumentPermissions()
		{
			var documentUserRecord = await (from documentUser in context.DocumentUsers.Include(du => du.Document)
											where documentUser.UserId == userId && documentUser.GameId == gameId && documentUser.DocumentId == documentId
											select documentUser).SingleOrDefaultAsync();
			if (documentUserRecord == null) return null;

			var game = await context.Games.FirstAsync(g => g.Id == gameId);
			var gameType = gameTypes.All[game.Type];
			var docType = gameType.ObjectTypes.First(dt => dt.Name == documentUserRecord.Document.Type);
			if (docType == null) return null;

			return PermissionList.From(docType.GetPermissions(gameId, documentId, documentUserRecord.Role));
		}
	}
}

public static class GamePermissionSetResolverExtensions
{
	public static Task<PermissionSet?> GetPermissionSet(this GamePermissionSetResolver permissionSetResolver, ClaimsPrincipal user, Guid gameId) =>
		permissionSetResolver.GetPermissions(user.GetUserIdOrThrow(), gameId);

	public static Task<PermissionSet?> GetPermissionSet(this GamePermissionSetResolver permissionSetResolver, ClaimsPrincipal user, Guid gameId, Guid docId) =>
		permissionSetResolver.GetPermissions(user.GetUserIdOrThrow(), gameId, docId);

	[return: NotNullIfNotNull(parameterName: nameof(permissionSet))]
	public static bool HasPermission(
		this PermissionSet permissionSet,
		string permission) =>
		permissionSet.Permissions.HasPermission(permission);

	public static async Task<bool?> HasPermission(
		this GamePermissionSetResolver permissionSetResolver,
		ClaimsPrincipal user,
		Guid gameId,
		string permission)
	{
		var permissionSet = await permissionSetResolver.GetPermissionSet(user, gameId);
		return permissionSet?.Permissions.HasPermission(permission);
	}

	public static async Task<bool?> HasPermission(
		this GamePermissionSetResolver permissionSetResolver,
		ClaimsPrincipal user,
		Guid gameId,
		Guid docId,
		string permission)
	{
		var permissionSet = await permissionSetResolver.GetPermissionSet(user, gameId, docId);
		return permissionSet?.Permissions.HasPermission(permission);
	}

}
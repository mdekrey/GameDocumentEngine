﻿using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Security;
using GameDocumentEngine.Server.Users;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.CodeAnalysis;
using System.Security.Claims;

namespace GameDocumentEngine.Server.Documents;

public class GamePermissionSetResolverFactory
{
	private readonly GameTypes gameTypes;

	public GamePermissionSetResolverFactory(GameTypes gameTypes)
	{
		this.gameTypes = gameTypes;
	}

	public GamePermissionSetResolver Create(Data.DocumentDbContext context) =>
		new(context, gameTypes);
}


/// <summary>
/// Do not depend on this directly within DbContext interceptors; it'll get stuck in a recursive loop constructing.
/// </summary>
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
		var gameUserRecord = await context.GameUsers.SingleOrDefaultAsync(gu => gu.UserId == userId && gu.GameId == gameId);
		if (gameUserRecord == null) return null;
		var documentUserRecord = await context.DocumentUsers.Include(du => du.Document)
			.SingleOrDefaultAsync(du => du.UserId == userId && du.GameId == gameId && du.DocumentId == documentId);

		return await GetPermissions(gameUserRecord, documentUserRecord);
	}

	public async Task<PermissionSet?> GetPermissions(GameUserModel gameUser, DocumentUserModel? documentUser)
	{
		if (documentUser is not null && documentUser.GameId != gameUser.GameId)
			throw new ArgumentException("Not from the same game!", nameof(documentUser));
		var userPermissions = gameUser.ToPermissions();

		var documentPermissions = documentUser == null
			? null
			: await GetDocumentPermissions();

		if (documentPermissions == null)
		{
			if (!userPermissions.HasPermission(GameSecurity.SeeAnyDocument(gameUser.GameId)))
				return null;

			return new(UserId: gameUser.UserId, userPermissions);
		}

		return new(UserId: gameUser.UserId, userPermissions.Add(documentPermissions));

		async Task<PermissionList?> GetDocumentPermissions()
		{
			var game = gameUser.Game
				?? context.Games.Local.FirstOrDefault(g => g.Id == gameUser.GameId)
				?? await context.Games.FirstAsync(g => g.Id == gameUser.GameId);
			var gameType = gameTypes.All[game.Type];
			var docType = gameType.ObjectTypes.First(dt => dt.Name == documentUser.Document.Type);
			if (docType == null) return null;

			return PermissionList.From(docType.GetPermissions(gameUser.GameId, documentUser.DocumentId, documentUser.Role));
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
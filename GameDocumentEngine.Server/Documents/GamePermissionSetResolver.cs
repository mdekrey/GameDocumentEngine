﻿using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Security;
using GameDocumentEngine.Server.Tracing;
using GameDocumentEngine.Server.Users;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.CodeAnalysis;
using System.Security.Claims;

namespace GameDocumentEngine.Server.Documents;


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

	public async Task<PermissionSet?> GetPermissions(Guid userId, long gameId)
	{
		using var activity = TracingHelper.StartActivity(nameof(GetPermissions));
		var gameUserRecord = await (from gameUser in context.GameUsers.Include(gu => gu.Game)
									where gameUser.UserId == userId && gameUser.GameId == gameId
									select gameUser).SingleOrDefaultAsync();
		if (gameUserRecord == null) return null;
		if (!gameTypes.All.TryGetValue(gameUserRecord.Game.Type, out var gameType))
			throw new InvalidOperationException($"Unknown game type: {gameUserRecord.Game.Type}");
		return gameType.ToPermissionSet(gameUserRecord);
	}

	public async Task<PermissionSet?> GetPermissions(Guid userId, long gameId, long documentId)
	{
		using var activity = TracingHelper.StartActivity(nameof(GetPermissions));
		var gameUserRecord = await context.GameUsers.Include(gu => gu.Game)
			.Include(gu => gu.Documents.Where(d => d.GameId == gameId && d.DocumentId == documentId)).ThenInclude(du => du.Document)
			.SingleOrDefaultAsync(gu => gu.UserId == userId && gu.GameId == gameId);
		if (gameUserRecord == null) return null;
		var documentUserRecord = gameUserRecord.Documents.SingleOrDefault(du => du.GameId == gameId && du.DocumentId == documentId);

		if (!gameTypes.All.TryGetValue(gameUserRecord.Game.Type, out var gameType))
			throw new InvalidOperationException($"Unknown game type: {gameUserRecord.Game.Type}");

		return await GetPermissions(
			gameUserRecord,
			documentUserRecord == null
				? null
				: (documentUserRecord.Document, documentUserRecord),
			gameType);
	}

	public async Task<PermissionSet?> GetPermissions(GameUserModel gameUser, (DocumentModel Document, DocumentUserModel? DocumentUser)? documentUserTuple, IGameType gameType)
	{
		PermissionList? documentPermissions = null;
		if (documentUserTuple is (var document, DocumentUserModel documentUser))
		{
			if (documentUser.GameId != gameUser.GameId || document.GameId != gameUser.GameId)
				throw new ArgumentException("Not from the same game!", nameof(documentUser));
			if (documentUser.DocumentId != document.Id)
				throw new ArgumentException("Not the same document", nameof(documentUserTuple));

			documentPermissions = documentUser == null
				? null
				: await GetDocumentPermissions();
		}
		var userPermissions = gameType.GetPermissions(gameUser.GameId, gameUser.Role);

		if (documentPermissions == null)
		{
			if (!userPermissions.HasPermission(GameSecurity.SeeAnyDocument(gameUser.GameId)))
				return null;

			return new(GameUser: gameUser, userPermissions);
		}

		return new(GameUser: gameUser, userPermissions.Add(documentPermissions));

		async Task<PermissionList?> GetDocumentPermissions()
		{
			var game = gameUser.Game
				?? context.Games.Local.FirstOrDefault(g => g.Id == gameUser.GameId)
				?? await context.Games.FirstAsync(g => g.Id == gameUser.GameId);
			var gameType = gameTypes.All[game.Type];
			var docType = gameType.ObjectTypes.FirstOrDefault(dt => dt.Key == document.Type);
			if (docType == null) return null;

			return PermissionList.From(docType.GetPermissions(gameUser.GameId, documentUser.DocumentId, documentUser.Role));
		}
	}
}

public static class GamePermissionSetResolverExtensions
{
	public static Task<PermissionSet?> GetPermissionSet(this GamePermissionSetResolver permissionSetResolver, ClaimsPrincipal user, long gameId) =>
		permissionSetResolver.GetPermissions(user.GetUserIdOrThrow(), gameId);

	public static Task<PermissionSet?> GetPermissionSet(this GamePermissionSetResolver permissionSetResolver, ClaimsPrincipal user, long gameId, long docId) =>
		permissionSetResolver.GetPermissions(user.GetUserIdOrThrow(), gameId, docId);

	[return: NotNullIfNotNull(parameterName: nameof(permissionSet))]
	public static bool HasPermission(
		this PermissionSet permissionSet,
		string permission) =>
		permissionSet.Permissions.HasPermission(permission);

	public static async Task<bool?> HasPermission(
		this GamePermissionSetResolver permissionSetResolver,
		ClaimsPrincipal user,
		long gameId,
		string permission)
	{
		var permissionSet = await permissionSetResolver.GetPermissionSet(user, gameId);
		return permissionSet?.Permissions.HasPermission(permission);
	}

	public static async Task<bool?> HasPermission(
		this GamePermissionSetResolver permissionSetResolver,
		ClaimsPrincipal user,
		long gameId,
		long docId,
		string permission)
	{
		var permissionSet = await permissionSetResolver.GetPermissionSet(user, gameId, docId);
		return permissionSet?.Permissions.HasPermission(permission);
	}

}
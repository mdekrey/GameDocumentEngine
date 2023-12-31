﻿using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Security;
using GameDocumentEngine.Server.Tracing;
using Microsoft.EntityFrameworkCore;

namespace GameDocumentEngine.Server.Documents;

class DocumentModelChangeNotifications : PermissionedEntityChangeNotifications<DocumentModel, DocumentUserModel, Api.DocumentDetails>
{
	private readonly DocumentUserLoader userLoader;
	private readonly GamePermissionSetResolverFactory permissionSetResolverFactory;
	private readonly GameTypes gameTypes;

	public DocumentModelChangeNotifications(
		DocumentUserLoader userLoader,
		IPermissionedApiMapper<DocumentModel, DocumentDetails> apiMapper,
		IApiChangeNotification<DocumentDetails> changeNotification,
		GamePermissionSetResolverFactory permissionSetResolverFactory,
		GameTypes gameTypes)
		: base(apiMapper, changeNotification)
	{
		this.userLoader = userLoader;
		this.permissionSetResolverFactory = permissionSetResolverFactory;
		this.gameTypes = gameTypes;
	}

	protected override async Task<DocumentModel> LoadTargetEntity(DocumentDbContext context, DocumentUserModel userEntity)
	{
		if (userEntity.Document != null) return userEntity.Document;
		return context.ChangeTracker.Entries<DocumentModel>().FirstOrDefault(d => d.Entity.GameId == userEntity.GameId && d.Entity.Id == userEntity.DocumentId)?.Entity
			?? await context.Documents.Include(d => d.Players).SingleAsync(d => d.GameId == userEntity.GameId && d.Id == userEntity.DocumentId);
	}

	protected override async Task<IEnumerable<PermissionSet>> GetUsersFor(DocumentDbContext context, DocumentModel entity, DbContextChangeUsage changeState)
	{
		using var activity = TracingHelper.StartActivity($"{nameof(DocumentModelChangeNotifications)}.{nameof(GetUsersFor)}");

		await userLoader.EnsureDocumentUsersLoaded(context, entity);
		var gameEntry = context.GetEntityEntries<GameModel>(g => g.Id == entity.GameId).Single();
		var documentUserEntries = context.GetEntityEntries<DocumentUserModel>(du => du.GameId == entity.GameId && du.DocumentId == entity.Id);
		var gameUserEntries = context.GetEntityEntries<GameUserModel>(g => g.GameId == entity.GameId);

		var game = gameEntry.AtState(changeState);
		var documentUsers = documentUserEntries.AtState(changeState);
		var gameUsers = gameUserEntries.AtState(changeState);

		if (!gameTypes.All.TryGetValue(game.Type, out var gameType))
			// TODO - consider a null game type, so that we don't just crash if a game type is removed
			throw new InvalidOperationException($"Unknown game type: {game.Type}");

		var byUser = (from gameUser in gameUsers
					  let documentUser = documentUsers.FirstOrDefault(du => du.GameId == gameUser.GameId && du.PlayerId == gameUser.PlayerId)
					  // Document User may not have existed for every user, such as when creating or destroying
					  // but may still have permission from game role
					  select new
					  {
						  gameUser,
						  documentUser
					  }).ToArray();

		var permissionSetResolver = permissionSetResolverFactory.Create(context);
		var permissions = await byUser
			.WhenAll(user => permissionSetResolver.GetPermissions(user.gameUser, (entity, user.documentUser), gameType))
			.Where(ps => ps != null)
			.Select(ps => ps!)
			.ToArrayAsync();

		return permissions;
	}
}

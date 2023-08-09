using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Security;
using GameDocumentEngine.Server.Tracing;
using Microsoft.EntityFrameworkCore;

namespace GameDocumentEngine.Server.Documents;

class DocumentModelChangeNotifications : PermissionedEntityChangeNotifications<DocumentModel, DocumentUserModel, Api.DocumentDetails>
{
	private readonly DocumentUserLoader userLoader;
	private readonly GamePermissionSetResolverFactory permissionSetResolverFactory;

	public DocumentModelChangeNotifications(
		DocumentUserLoader userLoader,
		IPermissionedApiMapper<DocumentModel, DocumentDetails> apiMapper,
		IApiChangeNotification<DocumentDetails> changeNotification,
		GamePermissionSetResolverFactory permissionSetResolverFactory)
		: base(apiMapper, changeNotification, du => du.UserId, du => du.Document)
	{
		this.userLoader = userLoader;
		this.permissionSetResolverFactory = permissionSetResolverFactory;
	}

	protected override async Task<DocumentModel> LoadTargetEntity(DocumentDbContext context, DocumentUserModel userEntity)
	{
		if (userEntity.Document != null) return userEntity.Document;
		return context.ChangeTracker.Entries<DocumentModel>().FirstOrDefault(d => d.Entity.Id == userEntity.DocumentId)?.Entity
			?? await context.Documents.Include(d => d.Players).SingleAsync(d => d.Id == userEntity.DocumentId);
	}

	protected override async Task<IEnumerable<PermissionSet>> GetUsersFor(DocumentDbContext context, DocumentModel entity, DbContextChangeUsage changeState)
	{
		using var activity = TracingHelper.StartActivity($"{nameof(DocumentModelChangeNotifications)}.{nameof(GetUsersFor)}");

		await userLoader.EnsureDocumentUsersLoaded(context, entity);
		var documentUserEntries = context.GetEntityEntries<DocumentUserModel>(du => du.GameId == entity.GameId && du.DocumentId == entity.Id);
		var gameUserEntries = context.GetEntityEntries<GameUserModel>(g => g.GameId == entity.GameId);

		var documentUsers = documentUserEntries.AtState(changeState);
		var gameUsers = gameUserEntries.AtState(changeState);

		var byUser = (from gameUser in gameUsers
					  let documentUser = documentUsers.FirstOrDefault(du => du.UserId == gameUser.UserId)
					  // Document User may not have existed for every user, such as when creating or destroying
					  where documentUser != null
					  select new
					  {
						  gameUser,
						  documentUser
					  }).ToArray();

		var permissionSetResolver = permissionSetResolverFactory.Create(context);
		var permissions = await byUser
			.WhenAll(user => permissionSetResolver.GetPermissions(user.gameUser, (entity, user.documentUser)))
			.Where(ps => ps != null)
			.Select(ps => ps!)
			.ToArrayAsync();

		return permissions;
	}
}

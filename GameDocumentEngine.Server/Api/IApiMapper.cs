using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Security;

namespace GameDocumentEngine.Server.Api;

public interface IApiMapper<TBase, TTarget> where TBase : class
{
	object ToKey(TBase entity);
	Task<TTarget> ToApi(DocumentDbContext dbContext, TBase entity);
	Task<TTarget> ToApiBeforeChanges(DocumentDbContext dbContext, TBase entity);
}

public interface IPermissionedApiMapper<TBase, TTarget> where TBase : class
{
	object ToKey(TBase entity);
	Task<TTarget> ToApi(DocumentDbContext dbContext, TBase entity, PermissionSet permissionSet, DbContextChangeUsage usage);
}

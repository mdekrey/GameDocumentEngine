using GameDocumentEngine.Server.Data;

namespace GameDocumentEngine.Server.Api;

public interface IApiMapper<TBase, TTarget> where TBase : class
{
	object ToKey(TBase entity);
	Task<TTarget> ToApi(DocumentDbContext dbContext, TBase entity);
}

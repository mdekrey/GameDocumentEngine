using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;

namespace GameDocumentEngine.Server.Users;

class UserModelApiMapper : IApiMapper<UserModel, Api.UserDetails>
{
	public Task<UserDetails> ToApi(DocumentDbContext dbContext, UserModel entity) =>
		Task.FromResult(ToApi(entity));

	public Task<UserDetails> ToApiBeforeChanges(DocumentDbContext dbContext, UserModel entity) =>
		Task.FromResult(ToApi(dbContext.Entry(entity).OriginalModel()
				?? throw new InvalidOperationException("Could not create original")));

	private static UserDetails ToApi(UserModel entity)
	{
		return new Api.UserDetails(
					Id: entity.Id,
					Name: entity.Name
				);
	}

	public object ToKey(UserModel entity) => entity.Id;
}

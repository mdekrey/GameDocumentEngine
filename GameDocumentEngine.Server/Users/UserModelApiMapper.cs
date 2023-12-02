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
					Name: entity.Name,
					ProfilePhoto: $"https://www.gravatar.com/avatar/{ToMD5(entity.EmailAddress.Trim().ToLowerInvariant())}?s=128",
					Options: entity.Options
				);
	}

	public object ToKey(UserModel entity) => entity.Id;

	private static string ToMD5(string input)
	{
		// Use input string to calculate MD5 hash
		using var md5 = System.Security.Cryptography.MD5.Create();
		var inputBytes = System.Text.Encoding.ASCII.GetBytes(input);
		var hashBytes = md5.ComputeHash(inputBytes);

		return Convert.ToHexString(hashBytes).ToLowerInvariant();
	}
}

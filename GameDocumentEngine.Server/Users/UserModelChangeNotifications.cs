using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;

namespace GameDocumentEngine.Server.Users;

class UserModelChangeNotifications : EntityChangeNotifications<UserModel, Api.UserDetails>
{
	public UserModelChangeNotifications(IApiMapper<UserModel, UserDetails> apiMapper, IApiChangeNotification<UserDetails> changeNotification) : base(apiMapper, changeNotification)
	{
	}

	protected override Task<IEnumerable<Guid>> GetUsersFor(DocumentDbContext context, UserModel entity)
	{
		return Task.FromResult((IEnumerable<Guid>)new[] { entity.Id });
	}
}

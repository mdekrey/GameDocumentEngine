using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Realtime;
using Json.Patch;
using Microsoft.AspNetCore.SignalR;

namespace GameDocumentEngine.Server.Users;

public class UserController : Api.UserControllerBase
{
	private readonly DocumentDbContext dbContext;
	private readonly IApiMapper<UserModel, UserDetails> apiMapper;

	public UserController(Data.DocumentDbContext dbContext, IApiMapper<UserModel, Api.UserDetails> apiMapper)
	{
		this.dbContext = dbContext;
		this.apiMapper = apiMapper;
	}

	protected override async Task<GetCurrentUserActionResult> GetCurrentUser()
	{
		var user = await dbContext.GetCurrentUser(User);
		if (user == null)
		{
			return GetCurrentUserActionResult.NotFound();
		}

		return GetCurrentUserActionResult.Ok(await ToUserDetails(user));
	}

	protected override async Task<PatchUserActionResult> PatchUser(JsonPatch patchUserBody)
	{
		var user = await dbContext.GetCurrentUser(User);
		if (user == null)
		{
			return PatchUserActionResult.BadRequest("No user found");
		}
		var updated = patchUserBody.Apply(await ToUserDetails(user))!;
		user.Name = updated.Name;
		await dbContext.SaveChangesAsync();

		return PatchUserActionResult.Ok(await ToUserDetails(user));
	}

	private Task<Api.UserDetails> ToUserDetails(UserModel user) => apiMapper.ToApi(dbContext, user);
}

class UserModelApiMapper : IApiMapper<UserModel, Api.UserDetails>
{
	public Task<UserDetails> ToApi(DocumentDbContext dbContext, UserModel entity) =>
		Task.FromResult(new Api.UserDetails(
			Id: entity.Id,
			Name: entity.Name
		));

	public object ToKey(UserModel entity) => entity.Id;
}

class UserModelChangeNotifications : EntityChangeNotifications<UserModel, Api.UserDetails>
{
	public UserModelChangeNotifications(IApiMapper<UserModel, UserDetails> apiMapper) : base(apiMapper)
	{
	}

	protected override bool HasAddedMessage => false;
	protected override Task SendAddedMessage(Data.DocumentDbContext context, IHubClients clients, UserModel result, object message) => Task.CompletedTask;

	protected override Task SendDeletedMessage(Data.DocumentDbContext context, IHubClients clients, UserModel original, object message) => Task.CompletedTask;

	protected override Task SendModifiedMessage(Data.DocumentDbContext context, IHubClients clients, UserModel original, object message)
	{
		// TODO: when name changes, send message to all games they're in
		return clients.Group(GroupNames.User(original.Id)).SendAsync("UserUpdated", message);
	}
}

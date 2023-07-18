using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Realtime;
using Json.Patch;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace GameDocumentEngine.Server.Users;

public class UserController : Api.UserControllerBase
{
	private readonly DocumentDbContext dbContext;

	public UserController(Data.DocumentDbContext dbContext)
	{
		this.dbContext = dbContext;
	}

	protected override async Task<GetCurrentUserActionResult> GetCurrentUser()
	{
		var user = await dbContext.GetCurrentUser(User);
		if (user == null)
		{
			return GetCurrentUserActionResult.NotFound();
		}

		return GetCurrentUserActionResult.Ok(ToUserDetails(user));
	}

	protected override async Task<PatchUserActionResult> PatchUser(JsonPatch patchUserBody)
	{
		var user = await dbContext.GetCurrentUser(User);
		if (user == null)
		{
			return PatchUserActionResult.BadRequest("No user found");
		}
		var updated = patchUserBody.Apply(ToUserDetails(user))!;
		user.Name = updated.Name;
		await dbContext.SaveChangesAsync();

		return PatchUserActionResult.Ok(ToUserDetails(user));
	}

	private Api.UserDetails ToUserDetails(UserModel user) => new Api.UserDetails(
		Id: user.Id,
		Name: user.Name
	);
}

class UserModelToUserDetails : EntityChangeNotifications<UserModel, Api.UserDetails>
{
	protected override bool HasAddedMessage => false;
	protected override Task SendAddedMessage(IHubClients clients, UserModel result, object message) => Task.CompletedTask;

	protected override Task SendDeletedMessage(IHubClients clients, UserModel original, object message)
	{
		return clients.Group(GroupNames.User(original.Id)).SendAsync("UserDeleted", message);
	}

	protected override Task SendModifiedMessage(IHubClients clients, UserModel original, object message)
	{
		return clients.Group(GroupNames.User(original.Id)).SendAsync("UserUpdated", message);
	}

	protected override UserDetails ToApi(UserModel entity) => new Api.UserDetails(
		Id: entity.Id,
		Name: entity.Name
	);

	protected override object ToKey(UserModel entity) => entity.Id;
}

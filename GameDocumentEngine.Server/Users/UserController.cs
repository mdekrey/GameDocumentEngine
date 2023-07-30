using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents;
using GameDocumentEngine.Server.Realtime;
using Json.Patch;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;

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
			await HttpContext.SignOutAsync();
			return GetCurrentUserActionResult.Unauthorized();
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

class UserApiChangeNotification : IApiChangeNotification<UserDetails>
{
	private readonly IHubContext<GameDocumentsHub> hubContext;

	public UserApiChangeNotification(IHubContext<GameDocumentsHub> hubContext)
	{
		this.hubContext = hubContext;
	}

	public Task SendAddedNotification(object apiKey, UserDetails newApiObject, Guid userId) => Task.CompletedTask;

	public Task SendDeletedNotification(object apiKey, Guid userId) => Task.CompletedTask;

	public async Task SendModifiedNotification(object apiKey, UserDetails oldApiObject, UserDetails newApiObject, Guid userId)
	{
		await hubContext.User(userId).SendWithPatch("User", apiKey, oldApiObject, newApiObject);
	}
}

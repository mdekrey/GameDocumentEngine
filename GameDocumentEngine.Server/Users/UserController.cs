using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents;
using Json.Patch;
using Microsoft.AspNetCore.Authentication;
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
		user.Options = updated.Options;
		await dbContext.SaveChangesAsync();

		return PatchUserActionResult.Ok(await ToUserDetails(user));
	}

	private Task<Api.UserDetails> ToUserDetails(UserModel user) => apiMapper.ToApi(dbContext, user);
}

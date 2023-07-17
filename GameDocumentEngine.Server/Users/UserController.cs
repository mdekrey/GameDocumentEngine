using GameDocumentEngine.Server.Data;
using Json.Patch;
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

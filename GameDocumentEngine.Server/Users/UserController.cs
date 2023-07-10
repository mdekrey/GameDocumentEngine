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

	async Task<UserModel?> LoadCurrentUser()
	{
		var id = GetCurrentUserId();

		return await dbContext.Users.FirstOrDefaultAsync(user => user.GoogleNameId == id);
	}

	private string GetCurrentUserId()
	{
		return User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value
			?? throw new InvalidOperationException("No name identifier - is this a google user?");
	}

	protected override async Task<GetCurrentUserActionResult> GetCurrentUser()
	{
		var user = await LoadCurrentUser();
		var isFirstTime = user == null;
		if (user == null)
		{
			user = new UserModel
			{
				GoogleNameId = GetCurrentUserId(),
				EmailAddress = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value ?? throw new InvalidOperationException("No email - is this a google user?"),
				Name = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value ?? throw new InvalidOperationException("No name - is this a google user?"),
				Id = Guid.NewGuid().ToString(),
			};
			dbContext.Users.Add(user);
			await dbContext.SaveChangesAsync();
		}

		return GetCurrentUserActionResult.Ok(new Api.CurrentUserDetails(user.Name, isFirstTime));
	}

	protected override async Task<PatchUserActionResult> PatchUser(JsonPatch patchUserBody)
	{
		var user = await LoadCurrentUser();
		if (user == null)
		{
			return PatchUserActionResult.BadRequest("No user found");
		}
		var updated = patchUserBody.Apply(ToUserDetails(user))!;
		user.Name = updated.Name;
		await dbContext.SaveChangesAsync();

		return PatchUserActionResult.Ok(new Api.UserDetails(user.Name));
	}

	private Api.UserDetails ToUserDetails(UserModel current) => new Api.UserDetails(
		Name: current.Name
	);
}

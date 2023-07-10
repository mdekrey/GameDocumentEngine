using GameDocumentEngine.Server.Data;
using Json.Patch;
using System.Security.Claims;

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
		var nameIdentifier = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)
			?? throw new InvalidOperationException("No name identifier - is this a google user?");

		var user = await dbContext.Users.FindAsync(nameIdentifier.Value);
		var isFirstTime = user == null;
		if (user == null)
		{
			user = new UserModel
			{
				GoogleNameId = nameIdentifier.Value,
				EmailAddress = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value ?? throw new InvalidOperationException("No email - is this a google user?"),
				Name = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value ?? throw new InvalidOperationException("No name - is this a google user?"),
				Id = Guid.NewGuid().ToString(),
			};
			dbContext.Users.Add(user);
			await dbContext.SaveChangesAsync();
		}

		return GetCurrentUserActionResult.Ok(new Api.CurrentUserDetails(user.Name, isFirstTime));
	}

	protected override Task<PatchUserActionResult> PatchUser(JsonPatch patchUserBody)
	{
		throw new NotImplementedException();
	}
}

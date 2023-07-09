using Json.Patch;
using System.Security.Claims;

namespace GameDocumentEngine.Server.Users;

public class UserController : Api.UserControllerBase
{
	protected override Task<GetCurrentUserActionResult> GetCurrentUser()
	{
		var email = User.Claims.FirstOrDefault(c => c.Type == ClaimValueTypes.Email);
		throw new NotImplementedException();
	}

	protected override Task<PatchUserActionResult> PatchUser(JsonPatch patchUserBody)
	{
		throw new NotImplementedException();
	}
}

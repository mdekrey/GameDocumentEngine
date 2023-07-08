using Json.Patch;

namespace GameDocumentEngine.Server.Users;

public class UserController : Api.UserControllerBase
{
	protected override Task<GetCurrentUserActionResult> GetCurrentUser()
	{
		throw new NotImplementedException();
	}

	protected override Task<PatchUserActionResult> PatchUser(JsonPatch patchUserBody)
	{
		throw new NotImplementedException();
	}
}

using GameDocumentEngine.Server.Api;
using Microsoft.AspNetCore.Authentication;

namespace GameDocumentEngine.Server.Users;

public class LoginController : LoginControllerBase
{
	protected override async Task<LoginActionResult> Login(string? returnUrl)
	{
		await HttpContext.SignOutAsync().ConfigureAwait(false);
		return LoginActionResult.Unsafe(Challenge(new AuthenticationProperties
		{
			RedirectUri = returnUrl ?? "/",
		}));
	}
}

using GameDocumentEngine.Server.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace GameDocumentEngine.Server.Security;

#if DEBUG
public class ImpersonationController : ControllerBase
{
	private readonly DocumentDbContext dbContext;

	public ImpersonationController(Data.DocumentDbContext dbContext)
	{
		this.dbContext = dbContext;
	}

	[HttpGet]
	[Route("/impersonate/{userId}")]
	public async Task<IActionResult> Impersonate(
		[FromRoute(Name = "userId"), Required, Range(0, 10000)] int userId)
	{
		if (!ModelState.IsValid) return BadRequest();

		var fakeNameId = $"fake-{userId}";
		var user = await dbContext.Users.SingleOrDefaultAsync(u => u.GoogleNameId == fakeNameId)
			?? new Users.UserModel
			{
				GoogleNameId = fakeNameId,
				EmailAddress = $"fake-{userId}@example.com",
				Name = $"Fake User {userId}",
			};
		if (user.Id == Guid.Empty)
		{
			dbContext.Users.Add(user);
			await dbContext.SaveChangesAsync();
		}

		var identity = new ClaimsIdentity(authenticationType: "Impersonation");
		identity.AddClaim(new Claim(ClaimTypes.UserData, user.Id.ToString()));
		var principal = new ClaimsPrincipal(identity);

		await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

		return Redirect("/");
	}
}
#endif

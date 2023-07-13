using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GameDocumentEngine.Server.Users;

public static class UserExtensions
{
	public static string GetGoogleNameIdOrThrow(this ClaimsPrincipal user) =>
		user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value
			?? throw new InvalidOperationException("No name identifier - is this a google user?");

	public static async Task<UserModel?> GetCurrentUser(this Data.DocumentDbContext dbContext, ClaimsPrincipal user)
	{
		var id = user.GetGoogleNameIdOrThrow();

		return await dbContext.Users.FirstOrDefaultAsync(user => user.GoogleNameId == id);
	}

	public static async Task<UserModel> GetCurrentUserOrThrow(this Data.DocumentDbContext dbContext, ClaimsPrincipal user) =>
		await dbContext.GetCurrentUser(user) ?? throw new InvalidOperationException("Could not find user");

}

using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GameDocumentEngine.Server.Users;

public static class UserExtensions
{
	public static string GetGoogleNameIdOrThrow(this ClaimsPrincipal user) =>
		user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value
			?? throw new InvalidOperationException("No name identifier - is this a google user?");

	public static Guid? GetCurrentUserId(this ClaimsPrincipal user)
	{
		var id = user.FindFirstValue(ClaimTypes.UserData);
		return Guid.TryParse(id, out var userId) ? userId : null;
	}

	public static Guid GetUserIdOrThrow(this ClaimsPrincipal user)
	{
		return user.GetCurrentUserId() ?? throw new InvalidOperationException("No user id from authenticated user");
	}

	public static async Task<UserModel?> GetCurrentUser(this Data.DocumentDbContext dbContext, ClaimsPrincipal user)
	{
		return GetCurrentUserId(user) is Guid userId ? await dbContext.Users.FindAsync(userId) : null;
	}

	public static async Task<UserModel> GetCurrentUserOrThrow(this Data.DocumentDbContext dbContext, ClaimsPrincipal user) =>
		await dbContext.GetCurrentUser(user) ?? throw new InvalidOperationException("Could not find user");

}

namespace GameDocumentEngine.Server.Security;

public class PermissionTests
{
	[InlineData("game:create", "game:create", true)]
	[InlineData("game:12345:edit", "game:12345:edit", true)]
	[InlineData("game:12345:edit", "game:12345:delete", false)]
	[InlineData("game:*:edit", "game:12345:edit", true)]
	[InlineData("game:*:edit", "game:12345:delete", false)]
	[InlineData("game:*:object:*:edit", "game:12345:edit", false)]
	[InlineData("game:*:object:*:edit", "game:12345:object:9876:edit", true)]
	[InlineData("game:**:edit", "game:12345:edit", true)]
	[InlineData("game:**:edit", "game:12345:object:9876:edit", true)]
	[InlineData("game:12345:o*:**", "game:12345:object:9876:edit", false)]
	[InlineData("game:12345:**:details#$../", "game:12345:object:9876:details", true)]
	[Theory]
	public void MatchPermission_Should_Allow_Matches(string pattern, string permission, bool allow)
	{
		Assert.Equal(allow, Permissions.MatchPermission(pattern, permission));
	}
}
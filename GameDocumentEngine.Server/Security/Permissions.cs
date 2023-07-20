using System.Collections.Immutable;
using System.Text.RegularExpressions;

namespace GameDocumentEngine.Server.Security;

public record PermissionList(ImmutableArray<string> Permissions)
{
	public static readonly PermissionList Empty = new PermissionList(ImmutableArray<string>.Empty);

	public static PermissionList From(params string[] permissions) => new PermissionList(permissions.ToImmutableArray());
}

public static class Permissions
{
	public static bool HasPermission(this PermissionList permissionList, string targetPermission)
	{
		return permissionList.Permissions.Any(p => MatchPermission(p, targetPermission));
	}

	public static bool MatchPermission(string permissionPattern, string targetPermission)
	{
		return ToPermissionPatternRegex(permissionPattern).IsMatch(targetPermission);
	}

	public static Regex ToPermissionPatternRegex(string permissionPattern)
	{
		var parts = from part in permissionPattern.Split(':')
					select part switch
					{
						"*" => "[^:]+",
						"**" => ".+",
						var s when s.Contains("**") => throw new InvalidOperationException("Deep-path wildcards may only be used as complete segments"),
						_ => part.Replace("*", "[^:]+"),
					};
		return new Regex($"^{string.Join(':', parts)}$");
	}
}

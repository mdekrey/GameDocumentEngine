namespace GameDocumentEngine.Server.Security;

public record PermissionSet(Guid UserId, PermissionList Permissions)
{
	// TODO: remove this stub
	public static readonly PermissionSet Stub = new PermissionSet(Guid.Empty, PermissionList.Empty);
}

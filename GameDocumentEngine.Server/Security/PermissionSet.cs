namespace GameDocumentEngine.Server.Security;

public record PermissionSet(Guid UserId, PermissionList Permissions);

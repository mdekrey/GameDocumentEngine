using GameDocumentEngine.Server.Documents;

namespace GameDocumentEngine.Server.Security;

public record PermissionSet(GameUserModel GameUser, PermissionList Permissions);

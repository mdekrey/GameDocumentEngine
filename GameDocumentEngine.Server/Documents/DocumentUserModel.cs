using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Users;

namespace GameDocumentEngine.Server.Documents;

#nullable disable warnings

public class DocumentUserModel : IAuditable
{
	public Guid GameId { get; set; }
	public Guid DocumentId { get; set; }
	public Guid UserId { get; set; }

	public DocumentModel Document { get; set; }
	public UserModel User { get; set; }
	public GameUserModel GameUser { get; set; }

	// TODO: some kind of permissioning here


	public DateTimeOffset CreatedDate { get; private set; }
	public string? CreatedBy { get; private set; }
	public DateTimeOffset LastModifiedDate { get; private set; }
	public string? LastModifiedBy { get; private set; }
}
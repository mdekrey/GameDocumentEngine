using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Users;

namespace GameDocumentEngine.Server.Documents;

#nullable disable warnings

public class GameUserModel : IAuditable
{
	public Guid GameId { get; set; }
	public Guid UserId { get; set; }

	public GameModel Game { get; set; }
	public UserModel User { get; set; }

	public string Role { get; set; }

	public ICollection<DocumentUserModel> Documents { get; private set; } = new List<DocumentUserModel>();


	public DateTimeOffset CreatedDate { get; private set; }
	public string? CreatedBy { get; private set; }
	public DateTimeOffset LastModifiedDate { get; private set; }
	public string? LastModifiedBy { get; private set; }
}

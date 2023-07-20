using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Security;

namespace GameDocumentEngine.Server.Documents;

#nullable disable warnings

public class GameModel : IAuditable
{
	public Guid Id { get; set; }
	public string Name { get; set; }
	public string Type { get; set; }

	public ICollection<GameUserModel> Players { get; } = new List<GameUserModel>();
	public ICollection<DocumentModel> Documents { get; } = new List<DocumentModel>();
	public ICollection<Security.GameInviteModel> ActiveInvites { get; } = new List<Security.GameInviteModel>();

	public DateTimeOffset CreatedDate { get; private set; }
	public string? CreatedBy { get; private set; }
	public DateTimeOffset LastModifiedDate { get; private set; }
	public string? LastModifiedBy { get; private set; }

}

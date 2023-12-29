using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Users;
using System.Text.Json.Nodes;

namespace GameDocumentEngine.Server.Documents;

#nullable disable warnings

public class GameUserModel : IAuditable
{
	public long GameId { get; set; }
	public long PlayerId { get; set; }
	public Guid UserId { get; set; }

	public GameModel Game { get; set; }
	public UserModel User { get; set; }
	public string? NameOverride { get; set; }

	// Role name from global game roles
	public string Role { get; set; }
	// User options for this game
	public JsonNode Options { get; set; }

	public ICollection<DocumentUserModel> Documents { get; private set; } = new List<DocumentUserModel>();


	public DateTimeOffset CreatedDate { get; private set; }
	public string? CreatedBy { get; private set; }
	public DateTimeOffset LastModifiedDate { get; private set; }
	public string? LastModifiedBy { get; private set; }
}

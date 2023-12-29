using GameDocumentEngine.Server.Documents;
using System.Text.Json.Nodes;

namespace GameDocumentEngine.Server.Users;

#nullable disable warnings

public class UserModel
{
	public Guid Id { get; set; }
	public string Name { get; set; }
	public string GoogleNameId { get; set; }
	public string EmailAddress { get; set; }
	public JsonNode Options { get; set; }
	public ICollection<Documents.GameUserModel> Games { get; } = new List<Documents.GameUserModel>();
}

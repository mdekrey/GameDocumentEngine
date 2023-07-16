using GameDocumentEngine.Server.Documents;

namespace GameDocumentEngine.Server.Users;

#nullable disable warnings

public class UserModel
{
	public Guid Id { get; set; }
	public string Name { get; set; }
	public string GoogleNameId { get; set; }
	public string EmailAddress { get; set; }
	public ICollection<Documents.GameUserModel> Games { get; } = new List<Documents.GameUserModel>();
	public ICollection<Documents.DocumentUserModel> Documents { get; } = new List<Documents.DocumentUserModel>();
}

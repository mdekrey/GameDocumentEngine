using GameDocumentEngine.Server.Data;
using System.Text.Json.Nodes;

namespace GameDocumentEngine.Server.Documents;

#nullable disable warnings

public class DocumentModel : IAuditable
{
	public Guid GameId { get; set; }
	public Guid Id { get; set; }
	public string Name { get; set; }
	public string Type { get; set; }

	public Guid? FolderId { get; set; }
	public DocumentModel? Folder { get; set; }
	public ICollection<DocumentModel> FolderContents { get; } = new List<DocumentModel>();

	public JsonNode Details { get; set; }

	public ICollection<DocumentUserModel> Players { get; } = new List<DocumentUserModel>();
	public GameModel Game { get; set; }

	public DateTimeOffset CreatedDate { get; private set; }
	public string? CreatedBy { get; private set; }
	public DateTimeOffset LastModifiedDate { get; private set; }
	public string? LastModifiedBy { get; private set; }
}

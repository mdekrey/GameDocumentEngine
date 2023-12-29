using GameDocumentEngine.Server.Api;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace GameDocumentEngine.Server.Documents;

#nullable disable warnings

class EditableDocumentModel
{
	[JsonPropertyName("name")] public string Name { get; set; }
	[JsonPropertyName("version")] public Guid Version { get; set; }
	[JsonPropertyName("folderId")] public Identifier? FolderId { get; set; }
	[JsonPropertyName("details")] public JsonNode Details { get; set; }


	public static EditableDocumentModel Create(DocumentModel model) => new EditableDocumentModel
	{
		Name = model.Name,
		Version = model.Version,
		FolderId = (Identifier?)model.FolderId,
		Details = model.Details,
	};
}

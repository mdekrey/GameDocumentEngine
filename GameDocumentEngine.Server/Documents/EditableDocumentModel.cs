using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace GameDocumentEngine.Server.Documents;

#nullable disable warnings

class EditableDocumentModel
{
	[JsonPropertyName("name")] public string Name { get; set; }
	[JsonPropertyName("details")] public JsonNode Details { get; set; }


	public static EditableDocumentModel Create(DocumentModel model) => new EditableDocumentModel
	{
		Name = model.Name,
		Details = model.Details,
	};
}

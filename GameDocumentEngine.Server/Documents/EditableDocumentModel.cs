using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace GameDocumentEngine.Server.Documents;

class EditableDocumentModel
{
	public EditableDocumentModel() { }
	public EditableDocumentModel(DocumentModel model)
	{
		Name = model.Name;
		Details = model.Details;
	}

	[JsonPropertyName("name")] public string Name { get; set; }
	[JsonPropertyName("details")] public JsonNode Details { get; set; }

}

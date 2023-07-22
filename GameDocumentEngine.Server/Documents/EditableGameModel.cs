using System.Text.Json.Serialization;

namespace GameDocumentEngine.Server.Documents;

#nullable disable warnings

public class EditableGameModel
{
	[JsonPropertyName("name")] public string Name { get; set; }


	public static EditableGameModel Create(GameModel model) => new EditableGameModel
	{
		Name = model.Name,
	};
}
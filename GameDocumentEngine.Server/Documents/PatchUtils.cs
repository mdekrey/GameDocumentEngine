using Json.Patch;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.CodeAnalysis;

namespace GameDocumentEngine.Server.Documents;

public record PatchError(string? Message);
public static class PatchUtils
{

	public static bool ApplyModelPatch<T, TEditable>(
		this JsonPatch jsonPatch,
		T target,
		Func<T, TEditable> toEditable,
		DbContext dbContext,
		[NotNullWhen(false)] out PatchError? error)
		where T : class
	{
		var editable = System.Text.Json.JsonSerializer.SerializeToNode(toEditable(target));
		var result = jsonPatch.Apply(editable);
		if (!result.IsSuccess)
		{
			error = new(result.Error);
			return false;
		}

		var resultDocument = System.Text.Json.JsonSerializer.Deserialize<TEditable>(result.Result);
		if (resultDocument == null)
		{
			error = new("Error deserializing result");
			return false;
		}
		dbContext.Entry(target).CurrentValues.SetValues(resultDocument);

		error = null;
		return true;
	}
}

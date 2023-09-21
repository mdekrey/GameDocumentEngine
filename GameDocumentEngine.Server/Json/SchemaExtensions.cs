using Json.Pointer;
using Json.Schema;

namespace GameDocumentEngine.Server.Json;

public static class SchemaExtensions
{
	public static IEnumerable<(JsonPointer Pointer, string ErrorType, string Message)> AllErrors(this EvaluationResults results)
	{
		if (results.IsValid) yield break;
		if (results.Errors != null)
			foreach (var error in results.Errors)
				yield return (results.InstanceLocation, error.Key, error.Value);

		foreach (var entry in from detail in results.Details
							  from error in detail.AllErrors()
							  select error)
		{
			yield return entry;
		}
	}
}

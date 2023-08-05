using GameDocumentEngine.Server.Data;
using System.Diagnostics;

namespace GameDocumentEngine.Server.Tracing;

public static class TracingHelper
{
	public static readonly ActivitySource ActivitySource = new(nameof(GameDocumentEngine));

	public static Activity? StartActivity(string name, ActivityKind kind = ActivityKind.Internal)
	{
		return ActivitySource.StartActivity(name, kind);
	}
}
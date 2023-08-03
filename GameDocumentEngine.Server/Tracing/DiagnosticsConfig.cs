using System.Diagnostics;

namespace GameDocumentEngine.Server.Tracing;

public static class DiagnosticsConfig
{
	public const string ServiceName = "MyService";
	public static ActivitySource ActivitySource = new ActivitySource(ServiceName);
}
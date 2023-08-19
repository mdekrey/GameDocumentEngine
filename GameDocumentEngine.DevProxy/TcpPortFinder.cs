using System.Net.Sockets;
using System.Net;

namespace GameDocumentEngine.DevProxy;

internal static class TcpPortFinder
{
	public static int FindAvailablePort()
	{
		var listener = new TcpListener(IPAddress.Loopback, 0);
		listener.Start();
		try
		{
			return ((IPEndPoint)listener.LocalEndpoint).Port;
		}
		finally
		{
			listener.Stop();
		}
	}
}
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.SpaServices;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Globalization;
using System.Text.RegularExpressions;

namespace GameDocumentEngine.DevProxy;

internal static class ViteDevelopmentServerMiddleware
{
	private const string LogCategoryName = "GameDocumentEngine.DevProxy.ViteDevelopmentServerMiddleware";
	private static readonly TimeSpan RegexMatchTimeout = TimeSpan.FromSeconds(5); // This is a development-time only feature, so a very long timeout is fine

	public static void Attach(
		ISpaBuilder spaBuilder,
		string baseCommand,
		string parameters)
	{
		var pkgManagerCommand = baseCommand;
		var sourcePath = spaBuilder.Options.SourcePath;
		var devServerPort = spaBuilder.Options.DevServerPort;
		if (string.IsNullOrEmpty(sourcePath))
		{
			throw new ArgumentException("Property 'SourcePath' cannot be null or empty", nameof(spaBuilder));
		}

		if (string.IsNullOrEmpty(parameters))
		{
			throw new ArgumentException("Cannot be null or empty", nameof(parameters));
		}

		// Start Vite and attach to middleware pipeline
		var appBuilder = spaBuilder.ApplicationBuilder;
		var applicationStoppingToken = appBuilder.ApplicationServices.GetRequiredService<IHostApplicationLifetime>().ApplicationStopping;
		var logger = LoggerFinder.GetOrCreateLogger(appBuilder, LogCategoryName);
		var diagnosticSource = appBuilder.ApplicationServices.GetRequiredService<DiagnosticSource>();
		var portTask = StartCreateViteAppServerAsync(sourcePath, parameters, pkgManagerCommand, devServerPort, logger, diagnosticSource, applicationStoppingToken);

		SpaProxyingExtensions.UseProxyToSpaDevelopmentServer(spaBuilder, async () =>
		{
			// On each request, we create a separate startup task with its own timeout. That way, even if
			// the first request times out, subsequent requests could still work.
			var timeout = spaBuilder.Options.StartupTimeout;
			var port = await portTask.WithTimeout(timeout, "The Vite server did not start listening for requests " +
				$"within the timeout period of {timeout.TotalSeconds} seconds. " +
				"Check the log output for error information.");

			// Everything we proxy is hardcoded to target http://localhost because:
			// - the requests are always from the local machine (we're not accepting remote
			//   requests that go directly to the Vite server)
			// - given that, there's no reason to use https, and we couldn't even if we
			//   wanted to, because in general the Vite server has no certificate
			return new UriBuilder("http", "localhost", port).Uri;
		});
	}

	private static async Task<int> StartCreateViteAppServerAsync(
		string sourcePath, string originalParameters, string command, int portNumber, ILogger logger, DiagnosticSource diagnosticSource, CancellationToken applicationStoppingToken)
	{
		if (portNumber == default(int))
		{
			portNumber = TcpPortFinder.FindAvailablePort();
		}
		if (logger.IsEnabled(LogLevel.Information))
		{
			logger.LogInformation($"Starting Vite server on port {portNumber}...");
		}

		var parameters = originalParameters.Replace("{port}", portNumber.ToString(CultureInfo.InvariantCulture));

		var envVars = new Dictionary<string, string>();
		var scriptRunner = new NodeScriptRunner(
			sourcePath, command, parameters, envVars, diagnosticSource, applicationStoppingToken);
		scriptRunner.AttachToLogger(logger);

		using (var stdErrReader = new EventedStreamStringReader(scriptRunner.StdErr))
		{
			try
			{
				// Although the Vite dev server may eventually tell us the URL it's listening on,
				// it doesn't do so until it's finished compiling, and even then only if there were
				// no compiler warnings. So instead of waiting for that, consider it ready as soon
				// as it starts listening for requests.
				await scriptRunner.StdOut.WaitForMatch(
					new Regex("ready in", RegexOptions.None, RegexMatchTimeout));
			}
			catch (EndOfStreamException ex)
			{
				throw new InvalidOperationException(
					$"The command '{command} {parameters}' exited without indicating that the " +
					"Vite server was listening for requests. The error output was: " +
					$"{stdErrReader.ReadAsString()}", ex);
			}
		}

		return portNumber;
	}
}

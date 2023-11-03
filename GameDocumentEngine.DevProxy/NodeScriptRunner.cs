﻿using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;

namespace GameDocumentEngine.DevProxy;

/// <summary>
/// Executes the <c>script</c> entries defined in a <c>package.json</c> file,
/// capturing any output written to stdio.
/// </summary>
internal sealed class NodeScriptRunner : IDisposable
{
	private Process? _process;
	public EventedStreamReader StdOut { get; }
	public EventedStreamReader StdErr { get; }

	private static readonly Regex AnsiColorRegex = new Regex("\x001b\\[[0-9;]*m", RegexOptions.None, TimeSpan.FromSeconds(1));

	public NodeScriptRunner(string workingDirectory, string command, string arguments, IDictionary<string, string>? envVars, DiagnosticSource diagnosticSource, CancellationToken applicationStoppingToken)
	{
		if (string.IsNullOrEmpty(workingDirectory))
		{
			throw new ArgumentException("Cannot be null or empty.", nameof(workingDirectory));
		}

		if (string.IsNullOrEmpty(arguments))
		{
			throw new ArgumentException("Cannot be null or empty.", nameof(arguments));
		}

		if (string.IsNullOrEmpty(command))
		{
			throw new ArgumentException("Cannot be null or empty.", nameof(command));
		}

		var exeToRun = command;
		var completeArguments = arguments;
		if (OperatingSystem.IsWindows())
		{
			// On Windows, the node executable is a .cmd file, so it can't be executed
			// directly (except with UseShellExecute=true, but that's no good, because
			// it prevents capturing stdio). So we need to invoke it via "cmd /c".
			exeToRun = "cmd";
			completeArguments = $"/c \"{command}\" {completeArguments}";
		}

		var processStartInfo = new ProcessStartInfo(exeToRun)
		{
			Arguments = completeArguments,
			UseShellExecute = false,
			RedirectStandardInput = true,
			RedirectStandardOutput = true,
			RedirectStandardError = true,
			WorkingDirectory = workingDirectory,
		};

		if (envVars != null)
		{
			foreach (var keyValuePair in envVars)
			{
				processStartInfo.Environment[keyValuePair.Key] = keyValuePair.Value;
			}
		}

		_process = LaunchNodeProcess(processStartInfo, command);
		StdOut = new EventedStreamReader(_process.StandardOutput);
		StdErr = new EventedStreamReader(_process.StandardError);

		applicationStoppingToken.Register(((IDisposable)this).Dispose);

		if (diagnosticSource.IsEnabled("Microsoft.AspNetCore.NodeServices.Npm.NpmStarted"))
		{
			WriteDiagnosticEvent(
				diagnosticSource,
				"Microsoft.AspNetCore.NodeServices.Npm.NpmStarted",
				new
				{
					processStartInfo = processStartInfo,
					process = _process
				});
		}

		[UnconditionalSuppressMessage("ReflectionAnalysis", "IL2026",
			Justification = "The values being passed into Write have the commonly used properties being preserved with DynamicDependency.")]
		static void WriteDiagnosticEvent<[DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicProperties)] TValue>(DiagnosticSource diagnosticSource, string name, TValue value)
			=> diagnosticSource.Write(name, value);
	}

	public void AttachToLogger(ILogger logger)
	{
		// When the node task emits complete lines, pass them through to the real logger
		StdOut.OnReceivedLine += line =>
		{
			if (!string.IsNullOrWhiteSpace(line) && logger.IsEnabled(LogLevel.Information))
			{
				// Node tasks commonly emit ANSI colors, but it wouldn't make sense to forward
				// those to loggers (because a logger isn't necessarily any kind of terminal)
				logger.LogInformation(StripAnsiColors(line));
			}
		};

		StdErr.OnReceivedLine += line =>
		{
			if (!string.IsNullOrWhiteSpace(line))
			{
				logger.LogError(StripAnsiColors(line));
			}
		};

		// But when it emits incomplete lines, assume this is progress information and
		// hence just pass it through to StdOut regardless of logger config.
		StdErr.OnReceivedChunk += chunk =>
		{
			Debug.Assert(chunk.Array != null);

			var containsNewline = Array.IndexOf(
				chunk.Array, '\n', chunk.Offset, chunk.Count) >= 0;
			if (!containsNewline)
			{
				Console.Write(chunk.Array, chunk.Offset, chunk.Count);
			}
		};
	}

	private static string StripAnsiColors(string line)
		=> AnsiColorRegex.Replace(line, string.Empty);

	private static Process LaunchNodeProcess(ProcessStartInfo startInfo, string commandName)
	{
		try
		{
			var process = Process.Start(startInfo)!;

			// See equivalent comment in OutOfProcessNodeInstance.cs for why
			process.EnableRaisingEvents = true;

			return process;
		}
		catch (Exception ex)
		{
			var message = $"Failed to start '{commandName}'. To resolve this:.\n\n"
						+ $"[1] Ensure that '{commandName}' is installed and can be found in one of the PATH directories.\n"
						+ $"    Current PATH enviroment variable is: {Environment.GetEnvironmentVariable("PATH")}\n"
						+ "    Make sure the executable is in one of those directories, or update your PATH.\n\n"
						+ "[2] See the InnerException for further details of the cause.";
			throw new InvalidOperationException(message, ex);
		}
	}

	void IDisposable.Dispose()
	{
		if (_process != null && !_process.HasExited)
		{
			_process.Kill(entireProcessTree: true);
			_process = null;
		}
	}
}

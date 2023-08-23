using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.SpaServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GameDocumentEngine.DevProxy;

/// <summary>
/// Extension methods for enabling Vite development server middleware support.
/// </summary>
public static class ViteDevelopmentServerMiddlewareExtensions
{
	/// <summary>
	/// Handles requests by passing them through to an instance of the vite server.
	/// This means you can always serve up-to-date CLI-built resources without having
	/// to run the vite server manually.
	///
	/// This feature should only be used in development. For production deployments, be
	/// sure not to enable the vite server.
	/// </summary>
	/// <param name="spaBuilder">The <see cref="ISpaBuilder"/>.</param>
	/// <param name="baseCommand">The name of the executable to launch.</param>
	/// <param name="parameters">The parameters to pass to the process. Will replace
	/// `{port}` with the port number.</param>
	public static void UseViteDevelopmentServer(
		this ISpaBuilder spaBuilder,
		string baseCommand,
		string parameters)
	{
		ArgumentNullException.ThrowIfNull(spaBuilder);

		var spaOptions = spaBuilder.Options;

		if (string.IsNullOrEmpty(spaOptions.SourcePath))
		{
			throw new InvalidOperationException($"To use {nameof(UseViteDevelopmentServer)}, you must supply a non-empty value for the {nameof(SpaOptions.SourcePath)} property of {nameof(SpaOptions)} when calling {nameof(SpaApplicationBuilderExtensions.UseSpa)}.");
		}

		ViteDevelopmentServerMiddleware.Attach(spaBuilder, baseCommand, parameters);
	}
}
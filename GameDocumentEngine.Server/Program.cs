using Azure.Identity;
using CompressedStaticFiles;
#if DEBUG
using GameDocumentEngine.DevProxy;
#endif
using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents;
using GameDocumentEngine.Server.Documents.Types;
using GameDocumentEngine.Server.DynamicTypes;
using GameDocumentEngine.Server.GameTypes;
using GameDocumentEngine.Server.Localization;
using GameDocumentEngine.Server.Realtime;
using GameDocumentEngine.Server.Tracing;
using GameDocumentEngine.Server.Users;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Azure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using OpenTelemetry.Exporter;
using OpenTelemetry.Instrumentation.AspNetCore;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using System.Security.AccessControl;
using System.Security.Claims;
using System.Text.Json;
using System.Text.RegularExpressions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var services = builder.Services;
services.AddHealthChecks();
services.AddControllers(config =>
{
	config.Filters.Add(new MvcActionFilter());

	config.InputFormatters.Add(new StreamInputFormatter());
	config.ModelMetadataDetailsProviders.Add(new SuppressChildValidationMetadataProvider(typeof(Stream)));
});
services.AddCompressedStaticFiles();
var signalr = services.AddSignalR();
if (builder.Configuration["Azure:SignalR:ConnectionString"] != null)
	signalr.AddAzureSignalR();
services.Configure<ForwardedHeadersOptions>(options =>
{
	options.ForwardLimit = 1;
	// When running within k8s, we don't need to set known proxies/networks
	options.KnownProxies.Clear();
	options.KnownNetworks.Clear();
	options.ForwardedHeaders = ForwardedHeaders.All;
});

if (builder.Environment.IsProduction() &&
	builder.Configuration["DataProtection:AzureKeyVault"] is string keyUri &&
	builder.Configuration["DataProtection:AzureBlobStorage"] is string blobUri)
{
	services
		.AddDataProtection()
		.PersistKeysToAzureBlobStorage(new Uri(blobUri), new DefaultAzureCredential())
		.ProtectKeysWithAzureKeyVault(new Uri(keyUri), new DefaultAzureCredential());
}

services
	.AddAuthentication(options =>
	{
		options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
		options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
		options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
	})
	.AddCookie(options =>
	{
		options.Cookie.Expiration = null;
		options.Cookie.Path = "/";
		options.Events.OnRedirectToAccessDenied =
			options.Events.OnRedirectToLogin = async c =>
			{
				await c.HttpContext.SignOutAsync();
				c.Response.StatusCode = 401;
			};
	})
	.AddGoogle(googleOptions =>
	{
		googleOptions.ClientId = builder.Configuration["Authentication:Google:ClientId"] ?? throw new InvalidOperationException("Google client not configured");
		googleOptions.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"] ?? throw new InvalidOperationException("Google client not configured");

		var originalOnCreatingTicket = googleOptions.Events.OnCreatingTicket;
		googleOptions.Events.
			OnCreatingTicket = async context =>
			{
				if (context.Principal == null) return; // Shouldn't happen
				var db = context.HttpContext.RequestServices.GetRequiredService<DocumentDbContext>();
				var googleNameId = context.Principal.GetGoogleNameIdOrThrow();
				var user = await db.Users.FirstOrDefaultAsync(u => u.GoogleNameId == googleNameId);
				if (user == null)
				{
					user = new UserModel
					{
						GoogleNameId = googleNameId,
						EmailAddress = context.Principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value ?? throw new InvalidOperationException("No email - is this a google user?"),
						Name = context.Principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value ?? throw new InvalidOperationException("No name - is this a google user?"),
					};
					db.Users.Add(user);
					await db.SaveChangesAsync();
				}

				var identity = new ClaimsIdentity(context.Principal.Identity);
				identity.AddClaim(new Claim(ClaimTypes.UserData, user.Id.ToString()));
				context.Principal = new ClaimsPrincipal(identity);
				await originalOnCreatingTicket(context);
			};
	});

services.AddMemoryCache();
services.AddTransient<JsonSchemaResolver>();
services.AddSingleton<GameTypes>();
services.AddSingleton<RollupManifestManager>();

var dynamicTypeOptions = builder.Configuration.GetSection("DynamicTypes").Get<DynamicTypeOptions>();
if (dynamicTypeOptions?.GameTypesRoot == null || dynamicTypeOptions.DocumentTypesRoot == null || dynamicTypeOptions.DocumentSchemaPath == null)
	throw new InvalidOperationException("Configuration invalid, check DynamicTypes key");

var gameObjectTypes = new List<IGameObjectType>();
foreach (var gameObjectTypeFolderPath in Directory.GetDirectories(dynamicTypeOptions.DocumentTypesRoot))
{
	var gameObjectTypeName = Path.GetFileName(gameObjectTypeFolderPath);
	var path = Path.Combine(gameObjectTypeFolderPath, "document-type.json");
	if (!File.Exists(path)) continue;
	using var stream = File.OpenRead(path)
		?? throw new InvalidOperationException($"Could not load file at {path}");
	var gameObjectType = JsonSerializer.Deserialize<JsonGameObjectType>(stream);
	if (gameObjectType != null)
	{
		if (gameObjectType.Key != gameObjectTypeName)
			throw new InvalidOperationException($"Key mismatch; expected {gameObjectTypeName} got {gameObjectType.Key}");
		gameObjectTypes.Add(gameObjectType);
		services.AddSingleton<IGameObjectType>(gameObjectType);
	}
}

foreach (var gameTypeFolderPath in
	Directory.GetDirectories(dynamicTypeOptions.GameTypesRoot))
{
	var path = Path.Combine(gameTypeFolderPath, "game-type.json");
	if (!File.Exists(path)) continue;
	using var stream = File.OpenRead(path)
		?? throw new InvalidOperationException($"Could not load file at {path}");
	var gameObjectType = JsonSerializer.Deserialize<JsonGameTypeBuilder>(stream);
	if (gameObjectType != null)
		services.AddSingleton(gameObjectType.Build(gameObjectTypes));
}
services.Configure<BuildOptions>(builder.Configuration.GetSection("Build"));
services.Configure<DynamicTypeOptions>(builder.Configuration.GetSection("DynamicTypes"));
services.Configure<LocalizationOptions>(builder.Configuration.GetSection("Localization"));

services.AddAuthorization(options =>
{
	options.AddPolicy("AuthenticatedUser", builder =>
	{
		builder.AddAuthenticationSchemes(CookieAuthenticationDefaults.AuthenticationScheme);
		builder.RequireAuthenticatedUser();
	});
	options.AddPolicy("LoginUser", builder =>
	{
		builder.AddAuthenticationSchemes(CookieAuthenticationDefaults.AuthenticationScheme);
		builder.AddAuthenticationSchemes(GoogleDefaults.AuthenticationScheme);
		builder.RequireAuthenticatedUser();
	});
});

services.AddSingleton<GamePermissionSetResolverFactory>();
services.AddTransient<GamePermissionSetResolver>();

services.AddScoped<IApiMapper<UserModel, UserDetails>, UserModelApiMapper>();
services.AddScoped<DocumentUserLoader>();
services.AddScoped<IPermissionedApiMapper<GameModel, GameDetails>, GameModelApiMapper>();
services.AddScoped<IPermissionedApiMapper<DocumentModel, DocumentDetails>, DocumentModelApiMapper>();
services.AddScoped<IApiMapper<IGameType, GameTypeDetails>, GameTypeApiMapper>();
services.AddScoped<IApiChangeNotification<DocumentDetails>, DocumentApiChangeNotification>();
services.AddScoped<IApiChangeNotification<UserDetails>, UserApiChangeNotification>();
services.AddScoped<IApiChangeNotification<GameDetails>, GameApiChangeNotification>();

services.AddHttpContextAccessor();
services.AddScoped<AuditableInterceptor>();
services.AddScoped<VersioningInterceptor>();
services.AddScoped<HubNotifyingInterceptor>();
services.AddScoped<IApiChangeDetector, UserModelChangeNotifications>();
services.AddScoped<IApiChangeDetector, DocumentModelChangeNotifications>();
services.AddScoped<IApiChangeDetector, GameModelChangeNotifications>();
services.AddScoped<IEntityChangeNotifications, UserModelChangeNotifications>();
services.AddScoped<IEntityChangeNotifications, DocumentModelChangeNotifications>();
services.AddScoped<IEntityChangeNotifications, GameModelChangeNotifications>();
services.AddDbContext<DocumentDbContext>((provider, o) =>
{
	o.UseNpgsql(builder.Configuration["Postgres:ConnectionString"]);
	o.AddInterceptors(provider.GetRequiredService<AuditableInterceptor>())
	 .AddInterceptors(provider.GetRequiredService<VersioningInterceptor>())
	 .AddInterceptors(provider.GetRequiredService<HubNotifyingInterceptor>());
});

services
	.AddOpenTelemetry()
	.WithTracing(tracerProviderBuilder =>
	{
		tracerProviderBuilder.AddOtlpExporter();
		tracerProviderBuilder
			.AddSource(TracingHelper.ActivitySource.Name)
			.ConfigureResource(resource =>
				resource.AddService(TracingHelper.ActivitySource.Name, serviceVersion: builder.Configuration["Build:GitHash"] ?? "local")
				.AddAttributes(new Dictionary<string, object>
				{
					{ "deployment.environment", builder.Environment.EnvironmentName }
				}))
			.AddAspNetCoreInstrumentation(cfg =>
			{
				cfg.RecordException = true;
			})
			.AddEntityFrameworkCoreInstrumentation(cfg =>
			{
				cfg.EnrichWithIDbCommand = (activity, cmd) =>
				{
					if (cmd.CommandType == System.Data.CommandType.Text)
					{
						var tables = Regex.Matches(cmd.CommandText, "FROM (?<table>[^( ]+)").Select(m => m.Groups["table"].Value).ToArray();
						if (tables.Length > 0)
							activity.DisplayName = string.Join('+', tables) + " on " + (cmd.Connection?.Database ?? activity.DisplayName);
					}
					else
					{
						activity.DisplayName = cmd.CommandText + " on " + (cmd.Connection?.Database ?? activity.DisplayName);
					}
				};
				cfg.SetDbStatementForText = true;
			});
	});
services.Configure<AspNetCoreInstrumentationOptions>(options =>
{
	options.Filter = (httpContext) =>
	{
		if (httpContext.Request.Path.Value?.StartsWith("/health") ?? false) return false;
		if (httpContext.Request.Path.Value?.StartsWith("/assets") ?? false) return false;
		if (httpContext.Request.Path.Value?.StartsWith("/hub") ?? false) return false;
		return true;
	};
});

services.AddSpaStaticFiles(configuration =>
{
#if DEBUG
	configuration.RootPath = "../GameDocumentEngine.Ui/dist";
#else
	configuration.RootPath = "wwwroot";
#endif
});


var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseForwardedHeaders();
if (app.Environment.IsDevelopment())
{
	app.UseHttpsRedirection();
}
app.UseHealthChecks("/health");
app.UseSpaStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

#if !DEBUG
app.UseCompressedStaticFiles(new StaticFileOptions
{
	OnPrepareResponse = ctx =>
	{
		if (ctx.Context.User.Identity?.IsAuthenticated is not true && ctx.Context.Request.Path.ToString().EndsWith("/index.html"))
		{
			ctx.Context.ChallengeAsync();
		}
		ctx.Context.Response.GetTypedHeaders().CacheControl =
			new Microsoft.Net.Http.Headers.CacheControlHeaderValue()
			{
				MustRevalidate = true,
				Public = true,
			};
	}
});
#endif

#pragma warning disable ASP0014 // Suggest using top level route registrations - this seems to be necessary to prevent the SPA middleware from overwriting controller requests
app.UseEndpoints(endpoints =>
			{
				endpoints.MapControllers();
				endpoints.MapHub<GameDocumentsHub>("/hub");
			});
#pragma warning restore ASP0014 // Suggest using top level route registrations

// Keep stray POSTs from hitting the SPA middleware
// Based on a comment in https://github.com/dotnet/aspnetcore/issues/5192
app.MapWhen(context => context.Request.Method == "GET" || context.Request.Method == "CONNECT", (when) =>
{
	when.UseSpa(spa =>
	{
#if DEBUG
		if (app.Environment.IsDevelopment())
		{
			spa.Options.SourcePath = "../GameDocumentEngine.Ui";

			spa.UseViteDevelopmentServer(Path.Combine(Directory.GetCurrentDirectory(), "../GameDocumentEngine.Ui/node_modules/.bin/vite"), "--port {port}");
		}
#endif
	});
});


using (var scope = app.Services.CreateScope())
{
	var dbContext = scope.ServiceProvider.GetRequiredService<DocumentDbContext>();

	if (args.Contains("--ef-migrate"))
	{
		dbContext.Database.Migrate();
		return;
	}
	else if (dbContext.Database.GetPendingMigrations().Any())
	{
		throw new InvalidOperationException($"Missing {dbContext.Database.GetPendingMigrations().Count()} unapplied migrations");
	}
}

app.Run();

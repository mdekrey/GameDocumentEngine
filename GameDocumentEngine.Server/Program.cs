using Azure.Identity;
using CompressedStaticFiles;
using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents;
using GameDocumentEngine.Server.Documents.Types;
using GameDocumentEngine.Server.Realtime;
using GameDocumentEngine.Server.Tracing;
using GameDocumentEngine.Server.Users;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
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
// TODO: move these to json, but find a way to support translations
services.AddSingleton<IGameType, GameDocumentEngine.Server.GameTypes.Clocks.ClocksGameType>();
services.AddSingleton<IGameType, GameDocumentEngine.Server.GameTypes.MouseGuard.MouseGuardGameType>();

foreach (var gameObjectTypeJson in typeof(JsonGameObjectType).Assembly.GetManifestResourceNames().Where(n => n.EndsWith(".document-type.json")))
{
	using var stream = typeof(JsonGameObjectType).Assembly.GetManifestResourceStream(gameObjectTypeJson);
	if (stream == null) throw new InvalidOperationException("Could not load embedded stream");
	var gameObjectType = JsonSerializer.Deserialize<JsonGameObjectType>(stream);
	if (gameObjectType != null)
		services.AddSingleton<IGameObjectType>(gameObjectType);
}

services.AddAuthorization(options =>
{
	options.AddPolicy("AuthenticatedUser", builder =>
	{
		builder.AddAuthenticationSchemes(CookieAuthenticationDefaults.AuthenticationScheme);
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
services.AddScoped<HubNotifyingInterceptor>();
services.AddScoped<IApiChangeDetector, UserModelChangeNotifications>();
services.AddScoped<IApiChangeDetector, DocumentModelChangeNotifications>();
services.AddScoped<IApiChangeDetector, GameModelChangeNotifications>();
services.AddScoped<IEntityChangeNotifications, UserModelChangeNotifications>();
services.AddScoped<IEntityChangeNotifications, DocumentModelChangeNotifications>();
services.AddScoped<IEntityChangeNotifications, GameModelChangeNotifications>();
services.AddDbContext<DocumentDbContext>((provider, o) =>
{
	if (builder.Configuration["Postgres:ConnectionString"] != null)
	{
		o.UseNpgsql(builder.Configuration["Postgres:ConnectionString"]);
	}
	else
	{
		o.UseSqlServer(builder.Configuration["Sql:ConnectionString"] ?? throw new InvalidOperationException("Sql and Postgres both are not configured"));
	}
	o.AddInterceptors(provider.GetRequiredService<AuditableInterceptor>())
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


var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseForwardedHeaders();
if (app.Environment.IsDevelopment())
{
	app.UseHttpsRedirection();
}
app.UseHealthChecks("/health");
app.UseDefaultFiles();

app.UseCompressedStaticFiles(new StaticFileOptions
{
	OnPrepareResponse = ctx =>
	{
		if (ctx.Context.User.Identity?.IsAuthenticated is not true)
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

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<GameDocumentsHub>("/hub");

if (app.Environment.IsDevelopment())
	using (var scope = app.Services.CreateScope())
	{
		var dbContext = scope.ServiceProvider.GetRequiredService<DocumentDbContext>();
		dbContext.Database.EnsureCreated();
	}

app.Run();

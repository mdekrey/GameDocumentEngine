using CompressedStaticFiles;
using GameDocumentEngine.Server.Api;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents;
using GameDocumentEngine.Server.Documents.Types;
using GameDocumentEngine.Server.Realtime;
using GameDocumentEngine.Server.Users;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using System.Security.AccessControl;
using System.Security.Claims;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// TODO: https://www.nuget.org/packages/Azure.Extensions.AspNetCore.DataProtection.Keys/

// Add services to the container.
var services = builder.Services;
services.AddHealthChecks();
services.AddControllers();
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
			options.Events.OnRedirectToLogin = c =>
			{
				c.Response.StatusCode = 401;
				return Task.CompletedTask;
			};
	})
	.AddGoogle(googleOptions =>
	{
		googleOptions.ClientId = builder.Configuration["Authentication:Google:ClientId"] ?? throw new InvalidOperationException("Google client not configured");
		googleOptions.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"] ?? throw new InvalidOperationException("Google client not configured");

		var originalOnRedirectToAuthorizationEndpoint = googleOptions.Events.OnRedirectToAuthorizationEndpoint;
		googleOptions.Events.
			OnRedirectToAuthorizationEndpoint = context =>
			{
				if (context.Request.Path.Value == "/login")
					return originalOnRedirectToAuthorizationEndpoint(context);

				context.Response.StatusCode = 401;
				return Task.CompletedTask;
			};
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

services.AddTransient<IApiMapper<UserModel, UserDetails>, UserModelApiMapper>();
services.AddTransient<IPermissionedApiMapper<GameModel, GameDetails>, GameModelApiMapper>();
services.AddTransient<IPermissionedApiMapper<DocumentModel, DocumentDetails>, DocumentModelApiMapper>();
services.AddTransient<IApiMapper<IGameType, GameTypeDetails>, GameTypeApiMapper>();
services.AddTransient<IApiChangeNotification<DocumentDetails>, DocumentApiChangeNotification>();
services.AddTransient<IApiChangeNotification<UserDetails>, UserApiChangeNotification>();
services.AddTransient<IApiChangeNotification<GameDetails>, GameApiChangeNotification>();

services.AddHttpContextAccessor();
services.AddTransient<AuditableInterceptor>();
services.AddTransient<HubNotifyingInterceptor>();
services.AddTransient<IEntityChangeNotifications, UserModelChangeNotifications>();
services.AddTransient<IEntityChangeNotifications, DocumentModelChangeNotifications>();
services.AddTransient<IEntityChangeNotifications, GameModelChangeNotifications>();
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

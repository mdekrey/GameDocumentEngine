using CompressedStaticFiles;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents;
using GameDocumentEngine.Server.Documents.Types;
using GameDocumentEngine.Server.GameTypes.Clocks;
using GameDocumentEngine.Server.Realtime;
using GameDocumentEngine.Server.Users;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var services = builder.Services;
services.AddHealthChecks();
services.AddControllers();
services.AddCompressedStaticFiles();
services.AddSignalR();

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
services.AddSingleton<GameObjectManifestManager>();
services.AddSingleton<IGameType, ClocksGameType>();

services.AddAuthorization(options =>
{
	options.AddPolicy("AuthenticatedUser", builder =>
	{
		builder.AddAuthenticationSchemes(CookieAuthenticationDefaults.AuthenticationScheme);
		builder.RequireAuthenticatedUser();
	});
});

services.AddHttpContextAccessor();
services.AddTransient<AuditableInterceptor>();
services.AddDbContext<DocumentDbContext>((provider, o) =>
{
	o.UseSqlServer(builder.Configuration["AzureSql:ConnectionString"] ?? throw new InvalidOperationException("AzureSql not configured"))
		.AddInterceptors(provider.GetRequiredService<AuditableInterceptor>());
});

services.AddScoped<MessageIdProvider>();

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseHttpsRedirection();
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

app.Use((doContinue) => async (context) =>
{
	var messageIdProvider = context.RequestServices.GetRequiredService<MessageIdProvider>();
	messageIdProvider.AddToResponse(context.Response);
	await doContinue(context);
});

app.MapControllers();
app.MapHub<GameDocumentsHub>("/hub");

using (var scope = app.Services.CreateScope())
{
	var dbContext = scope.ServiceProvider.GetRequiredService<DocumentDbContext>();
	dbContext.Database.EnsureCreated();
}

app.Run();

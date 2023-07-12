using CompressedStaticFiles;
using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Documents;
using GameDocumentEngine.Server.GameTypes.Clocks;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var services = builder.Services;
services.AddHealthChecks();
services.AddControllers();
services.AddCompressedStaticFiles();

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
						return System.Threading.Tasks.Task.CompletedTask;
					};
	});

services.AddSingleton<IGameType, ClocksGameType>();

services.AddAuthorization(options =>
{
	options.AddPolicy("AuthenticatedUser", builder =>
	{
		builder.AddAuthenticationSchemes(CookieAuthenticationDefaults.AuthenticationScheme);
		builder.RequireAuthenticatedUser();
	});
});

services.AddDbContext<DocumentDbContext>(o =>
{
	o.UseCosmos(
		builder.Configuration["CosmosDb:ServiceUrl"] ?? throw new InvalidOperationException("CosmosDb not configured"),
		builder.Configuration["CosmosDb:AuthKey"] ?? throw new InvalidOperationException("CosmosDb not configured"),
		builder.Configuration["CosmosDb:DatabaseId"] ?? throw new InvalidOperationException("CosmosDb not configured")
	);
});

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

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
	var dbContext = scope.ServiceProvider.GetRequiredService<DocumentDbContext>();
	dbContext.Database.EnsureCreated();
}

app.Run();

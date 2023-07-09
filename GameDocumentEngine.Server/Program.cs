using CompressedStaticFiles;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;

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

services.AddAuthorization(options =>
{
	options.AddPolicy("AuthenticatedUser", builder =>
	{
		builder.AddAuthenticationSchemes(CookieAuthenticationDefaults.AuthenticationScheme);
		builder.RequireAuthenticatedUser();
	});
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

app.Run();

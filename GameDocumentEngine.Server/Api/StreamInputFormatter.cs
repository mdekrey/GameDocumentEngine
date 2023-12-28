using Microsoft.AspNetCore.Mvc.Formatters;

namespace GameDocumentEngine.Server.Api;

public class StreamInputFormatter : IInputFormatter
{
	private readonly IReadOnlyList<string> _allowedMimeTypes = new[]
	{
		"application/x-zip"
	};

	public bool CanRead(InputFormatterContext context)
	{
		ArgumentNullException.ThrowIfNull(context, nameof(context));

		var contentType = context.HttpContext.Request.ContentType;
		if (contentType == null) return false;
		if (!_allowedMimeTypes.Any(x => x.Contains(contentType))) return false;

		return true;
	}

	public async Task<InputFormatterResult> ReadAsync(InputFormatterContext context)
	{
		ArgumentNullException.ThrowIfNull(context, nameof(context));

		var memoryStream = new MemoryStream();
		await context.HttpContext.Request.Body.CopyToAsync(memoryStream);
		return await InputFormatterResult.SuccessAsync(memoryStream);
	}
}

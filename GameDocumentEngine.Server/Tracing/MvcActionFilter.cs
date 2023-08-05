using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;

namespace GameDocumentEngine.Server.Tracing;

public class MvcActionFilter : IAsyncActionFilter
{
	public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
	{
		using var activity = context.ActionDescriptor switch
		{
			ControllerActionDescriptor { ControllerName: var controllerName, ActionName: var actionName } => TracingHelper.StartActivity($"{controllerName}.{actionName}"),
			_ => null,
		};

		await next();
	}
}

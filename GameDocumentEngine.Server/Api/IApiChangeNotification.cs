using GameDocumentEngine.Server.Realtime;
using Json.Patch;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json.Linq;
using PrincipleStudios.OpenApiCodegen.Json.Extensions;

namespace GameDocumentEngine.Server.Api;

interface IApiChangeNotification<TApi>
{
	Task SendAddedNotification(object apiKey, TApi newApiObject, Guid userId);
	Task SendDeletedNotification(object apiKey, Guid userId);
	Task SendModifiedNotification(object apiKey, TApi oldApiObject, TApi newApiObject, Guid userId);
	Task SendNotification(object apiKey, Optional<TApi>? maybeOldApiObject, Optional<TApi>? maybeNewApiObject, Guid userId)
	{
		return (Old: maybeOldApiObject, New: maybeNewApiObject) switch
		{
			(Old: Optional<TApi>.Present { Value: var oldValue }, New: Optional<TApi>.Present { Value: var newValue }) => SendModifiedNotification(apiKey, oldValue, newValue, userId),
			(Old: Optional<TApi>.Present, New: _) => SendDeletedNotification(apiKey, userId),
			(Old: _, New: Optional<TApi>.Present { Value: var newValue }) => SendAddedNotification(apiKey, newValue, userId),
			_ => Task.CompletedTask
		};
	}

}

static class ApiChangeNotification
{
	public static IClientProxy User<THub>(this IHubContext<THub> context, Guid userId) where THub : Hub =>
		context.Clients.Group(GroupNames.UserDirect(userId));

	public static Task SendValue<TApi>(this IClientProxy target, string typeName, object key, TApi value) =>
		target.SendAsync("EntityChanged", typeName, new { key, value });
	public static Task SendWithoutValue(this IClientProxy target, string typeName, object key) =>
		target.SendAsync("EntityChanged", typeName, new { key });
	public static Task SendDeleted(this IClientProxy target, string typeName, object key) =>
		target.SendAsync("EntityChanged", typeName, new { key, removed = true });
	public static Task SendWithPatch<TApi>(this IClientProxy target, string typeName, object key, TApi oldApiObject, TApi newApiObject)
	{
		var patch = PatchExtensions.CreatePatch(oldApiObject, newApiObject);
		if (patch.Operations.Count > 0)
			return target.SendAsync("EntityChanged", typeName, new { key, patch });
		return Task.CompletedTask;
	}
}
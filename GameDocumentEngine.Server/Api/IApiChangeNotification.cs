using GameDocumentEngine.Server.Realtime;
using Json.Patch;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json.Linq;

namespace GameDocumentEngine.Server.Api;

interface IApiChangeNotification<TApi>
{
	ValueTask SendAddedNotification(object apiKey, TApi newApiObject, Guid userId);
	ValueTask SendDeletedNotification(object apiKey, Guid userId);
	ValueTask SendModifiedNotification(object apiKey, TApi oldApiObject, TApi newApiObject, Guid userId);

}

static class ApiChangeNotification
{
	public static IClientProxy User<THub>(this IHubContext<THub> context, Guid userId) where THub : Hub =>
		context.Clients.Group(GroupNames.UserDirect(userId));

	public static Task SendValue<TApi>(this IClientProxy target, string eventName, object key, TApi value) =>
		target.SendAsync(eventName, new { key, value });
	public static Task SendWithoutValue(this IClientProxy target, string eventName, object key) =>
		target.SendAsync(eventName, new { key });
	public static Task SendDeleted(this IClientProxy target, string eventName, object key) =>
		target.SendAsync(eventName, new { key, removed = true });
	public static Task SendWithPatch<TApi>(this IClientProxy target, string eventName, object key, TApi oldApiObject, TApi newApiObject)
	{
		var patch = PatchExtensions.CreatePatch(oldApiObject, newApiObject);
		return target.SendAsync(eventName, new { key, patch });
	}
}
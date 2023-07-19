using Azure;

namespace GameDocumentEngine.Server.Realtime;

public class MessageIdProvider
{
	private readonly List<Func<Guid, Task>> deferredActions = new List<Func<Guid, Task>>();
	private readonly Guid messageId;

	public MessageIdProvider()
	{
		messageId = Guid.NewGuid();
	}

	internal void Defer(Func<Guid, Task> deferredAction)
	{
		deferredActions.Add(deferredAction);
	}

	private Func<Task> ExecuteStarting(HttpResponse response) => () =>
	{
		if (deferredActions.Count == 0) return Task.CompletedTask;
		response.Headers.Add("x-message-id", messageId.ToString());
		return Task.CompletedTask;
	};

	private async Task ExecuteDeferred()
	{
		if (deferredActions.Count == 0) return;
		foreach (var entry in deferredActions)
		{
			await entry(messageId);
		}
	}

	internal void AddToResponse(HttpResponse response)
	{
		response.OnStarting(ExecuteStarting(response));
		response.OnCompleted(ExecuteDeferred);
	}
}

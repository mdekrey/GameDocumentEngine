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

	private async Task ExecuteDeferred()
	{
		if (deferredActions.Count == 0) return;
		await Task.Delay(50);
		foreach (var entry in deferredActions)
		{
			await entry(messageId);
		}
	}

	internal void AddToResponse(HttpResponse response)
	{
		response.Headers.Add("x-message-id", messageId.ToString());
		response.OnCompleted(ExecuteDeferred);
	}
}

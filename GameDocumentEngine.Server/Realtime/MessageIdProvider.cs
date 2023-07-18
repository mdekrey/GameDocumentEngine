namespace GameDocumentEngine.Server.Realtime;

public class MessageIdProvider
{
	private readonly List<Func<Task>> deferredActions = new List<Func<Task>>();

	public MessageIdProvider()
	{
		MessageId = Guid.NewGuid();
	}

	public Guid MessageId { get; }

	internal void Defer(Func<Task> deferredAction)
	{
		deferredActions.Add(deferredAction);
	}

	public async Task ExecuteDeferred()
	{
		await Task.Delay(50);
		foreach (var entry in deferredActions)
		{
			await entry();
		}
	}
}

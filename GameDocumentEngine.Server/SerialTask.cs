namespace GameDocumentEngine.Server;

public static class SerialTask
{
	public static async Task WhenAll<TIn>(this IEnumerable<TIn> input, Func<TIn, Task> operation)
	{
		foreach (var item in input)
		{
			await operation(item);
		}
	}
	public static async IAsyncEnumerable<TOut> WhenAll<TIn, TOut>(this IEnumerable<TIn> input, Func<TIn, Task<TOut>> operation)
	{
		foreach (var item in input)
		{
			yield return await operation(item);
		}
	}
}
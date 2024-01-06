using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;

namespace GameDocumentEngine.Server.Api;

public class FormValueJsonProvider : BindingSourceValueProvider, IEnumerableValueProvider
{
	private readonly IFormCollection _values;
	private PrefixContainer? _prefixContainer;

	/// <summary>
	/// Creates a value provider for <see cref="IFormCollection"/>.
	/// </summary>
	/// <param name="bindingSource">The <see cref="BindingSource"/> for the data.</param>
	/// <param name="values">The key value pairs to wrap.</param>
	/// <param name="culture">The culture to return with ValueProviderResult instances.</param>
	public FormValueJsonProvider(
		BindingSource bindingSource,
		IFormCollection values,
		CultureInfo? culture)
		: base(bindingSource)
	{
		ArgumentNullException.ThrowIfNull(bindingSource);
		ArgumentNullException.ThrowIfNull(values);

		_values = values;
		Culture = culture;
	}

	/// <summary>
	/// The culture to use.
	/// </summary>
	public CultureInfo? Culture { get; }

	/// <summary>
	/// The prefix container.
	/// </summary>
	protected PrefixContainer PrefixContainer
	{
		get
		{
			if (_prefixContainer == null)
			{
				_prefixContainer = new PrefixContainer(_values.Keys);
			}

			return _prefixContainer;
		}
	}

	/// <inheritdoc />
	public override bool ContainsPrefix(string prefix)
	{
		return PrefixContainer.ContainsPrefix(prefix);
	}

	/// <inheritdoc />
	public virtual IDictionary<string, string> GetKeysFromPrefix(string prefix)
	{
		ArgumentNullException.ThrowIfNull(prefix);

		return PrefixContainer.GetKeysFromPrefix(prefix);
	}

	/// <inheritdoc />
	public override ValueProviderResult GetValue(string key)
	{
		ArgumentNullException.ThrowIfNull(key);

		if (key.Length == 0)
		{
			// Top level parameters will fall back to an empty prefix when the parameter name does not
			// appear in any value provider. This would result in the parameter binding to a form parameter
			// with a empty key (e.g. Request body looks like "=test") which isn't a scenario we want to support.
			// Return a "None" result in this event.
			return ValueProviderResult.None;
		}

		var values = _values[key];
		if (values.Count == 0)
		{
			return ValueProviderResult.None;
		}
		else
		{
			return new ValueProviderResult(values, Culture);
		}
	}
}

public class FormValueJsonProviderFactory : IValueProviderFactory
{
	/// <inheritdoc />
	public Task CreateValueProviderAsync(ValueProviderFactoryContext context)
	{
		ArgumentNullException.ThrowIfNull(context);

		var request = context.ActionContext.HttpContext.Request;
		if (request.HasFormContentType)
		{
			// Allocating a Task only when the body is form data.
			return AddValueProviderAsync(context);
		}

		return Task.CompletedTask;
	}

	public async Task AddValueProviderAsync(ValueProviderFactoryContext context)
	{
		var request = context.ActionContext.HttpContext.Request;
		IFormCollection form;

		try
		{
			form = await request.ReadFormAsync();
		}
		catch (InvalidDataException ex)
		{
			// ReadFormAsync can throw InvalidDataException if the form content is malformed.
			// Wrap it in a ValueProviderException that the CompositeValueProvider special cases.
			throw new ValueProviderException($"FormatFailedToReadRequestForm: {ex.Message}", ex);
		}
		catch (IOException ex)
		{
			// ReadFormAsync can throw IOException if the client disconnects.
			// Wrap it in a ValueProviderException that the CompositeValueProvider special cases.
			throw new ValueProviderException($"FormatFailedToReadRequestForm: {ex.Message}", ex);
		}

		var valueProvider = new FormValueJsonProvider(
			BindingSource.Form,
			form,
			CultureInfo.CurrentCulture);

		context.ValueProviders.Add(valueProvider);
	}
}
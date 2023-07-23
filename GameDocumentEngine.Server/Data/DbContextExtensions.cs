﻿using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.ChangeTracking.Internal;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System.Linq;
using System.Linq.Expressions;
using System.Runtime.CompilerServices;

namespace GameDocumentEngine.Server.Data;

public static class DbContextExtensions
{
	private static readonly ConditionalWeakTable<object, object> compiledExpressions = new ConditionalWeakTable<object, object>();

	/// <summary>
	/// Tracks expressions and their compiled equivalents in a weak table; if the
	/// expression is garbage collected, so is the compiled version.
	/// </summary>
	private static Func<T, bool> GetCompiledExpression<T>(Expression<Func<T, bool>> expression)
	{
		if (!compiledExpressions.TryGetValue(expression, out var result))
		{
			result = expression.Compile();
			compiledExpressions.Add(expression, result);
		}
		return (Func<T, bool>)result;
	}

	public static async Task<EntityEntry<T>[]> LoadEntityEntriesAsync<T>(this DbContext context, Expression<Func<T, bool>> filter)
		where T : class
	{
		// `allEntities` gets thrown away intentionally; we're just looking to get the
		// entities from the database into the change tracker
		var allEntities = await context.Set<T>().Where(filter).ToArrayAsync();

		var filterFunc = GetCompiledExpression(filter);
		return context.ChangeTracker.Entries<T>().Where(e => filterFunc(e.Entity)).ToArray();
	}
	public static EntityEntry<T>[] GetEntityEntries<T>(this DbContext context, Func<T, bool> filter)
		where T : class
	{
		return context.ChangeTracker.Entries<T>().Where(e => filter(e.Entity)).ToArray();
	}

	public static EntityEntry<T>[] AtStateEntries<T>(this IEnumerable<EntityEntry<T>> entries, DbContextChangeUsage changeState)
		where T : class
	{
		return (from entry in entries
				where entry.State != EntityState.Detached
				where changeState == DbContextChangeUsage.BeforeChange
					? entry.State != EntityState.Added
					: entry.State != EntityState.Deleted
				select entry).ToArray();

	}

	public static T[] AtState<T>(this IEnumerable<EntityEntry<T>> entries, DbContextChangeUsage changeState)
		where T : class
	{
		return (from entry in entries.AtStateEntries(changeState)
				select entry.AtState(changeState)).ToArray();
	}

	public static T AtState<T>(this EntityEntry<T> entry, DbContextChangeUsage changeState)
		where T : class
	{
		return changeState == DbContextChangeUsage.BeforeChange
			? OriginalModel(entry)
			: entry.Entity;
	}

	public static T OriginalModel<T>(this EntityEntry<T> entityEntry)
		where T : class
	{
		return entityEntry.OriginalValues.Clone().ToObject() as T
			?? throw new InvalidOperationException("Could not create original");
	}

	public static IEnumerable<EntityEntry<TTarget>> Entries<TEntity, TTarget>(this CollectionEntry<TEntity, TTarget> collection, DbContext dbContext)
		where TEntity : class
		where TTarget : class =>
		collection.CurrentValue!.Select(collection.FindEntry)!;

	public static async Task LoadWithFixupAsync<TEntity, TTarget>(this ReferenceEntry<TEntity, TTarget> referenceEntry)
		where TEntity : class
		where TTarget : class
	{
		// TODO: https://github.com/mdekrey/GameDocumentEngine/issues/1
		if (referenceEntry.TargetEntry == null)
		{
			var oldState = referenceEntry.EntityEntry.State;
			referenceEntry.CurrentValue = await referenceEntry.Query().SingleOrDefaultAsync();
			referenceEntry.EntityEntry.State = oldState;
		}
	}
}
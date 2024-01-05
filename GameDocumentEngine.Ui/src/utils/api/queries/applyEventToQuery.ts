import type {
	QueryClient,
	QueryFunction,
	QueryKey,
} from '@tanstack/react-query';
import type { Draft } from 'immer';
import { produce } from 'immer';
import { applyPatch, type Patch } from 'rfc6902';
import type { EntityChangedProps } from '../EntityChangedProps';

/**
 * @returns {undefined|T} Undefined if the cache was invalidated, otherwise the new value of the cache
 */
export async function applyEventToQuery<T>(
	queryClient: QueryClient,
	target: { queryKey: QueryKey; queryFn?: QueryFunction<T> },
	event: EntityChangedProps<unknown, T>,
) {
	if ('removed' in event) {
		// Sometimes, we get the message that a doc has been deleted before saved to the database, like locally. Putting a delay on removing helps that.
		setTimeout(() => void queryClient.resetQueries(target), 500);
	} else if ('patch' in event) {
		return await applyPatchToQuery<T>(queryClient, target, event.patch);
	} else if ('value' in event) {
		queryClient.setQueryData(target.queryKey, event.value);
		return event.value;
	} else {
		await queryClient.invalidateQueries(target);
	}
}

/**
 * @returns {undefined|T} Undefined if the cache was invalidated, otherwise the new value of the cache
 */
export async function applyPatchToQuery<T>(
	queryClient: QueryClient,
	{ queryKey }: { queryKey: QueryKey; queryFn?: QueryFunction<T> },
	patch: Patch,
) {
	const data = queryClient.getQueryData<T>(queryKey);
	if (data === undefined) return;
	const result = JSON.parse(JSON.stringify(data)) as T;
	const errors = applyPatch(result, patch);
	if (errors.some((v) => !!v)) {
		console.error('failed to apply patch', { queryKey, patch, data });
		await queryClient.invalidateQueries({ queryKey });
	} else {
		queryClient.setQueryData(queryKey, result);
		return result;
	}
}

/**
 * @returns {undefined|T} Undefined if the cache was invalidated, otherwise the new value of the cache
 */
export async function applyChangeToQuery<T = unknown>(
	queryClient: QueryClient,
	{ queryKey }: { queryKey: QueryKey; queryFn?: QueryFunction<T> },
	recipe: (draft: Draft<T>) => void,
) {
	const data = queryClient.getQueryData<T>(queryKey);
	if (data === undefined) return;
	try {
		const result = produce(data as T, (draft) => void recipe(draft));
		queryClient.setQueryData(queryKey, result);
	} catch (ex) {
		console.error(ex);
		await queryClient.invalidateQueries({ queryKey });
	}
}

export type MapQueryResult<T, TAdditional> = {
	data: Map<string, T>;
	forceReload?: number;
	additional: TAdditional;
};
export type MapQueryConfig<T, TAdditional> = {
	queryKey: QueryKey;
	queryFn: QueryFunction<MapQueryResult<T, TAdditional>>;
	mapAdditionalProps(
		data: Map<string, T>,
		prevAdditional?: TAdditional,
	): TAdditional;
};
export async function applyChangeToMapQuery<T, TAdditional>(
	queryClient: QueryClient,
	{
		queryKey,
		mapAdditionalProps,
	}: Pick<MapQueryConfig<T, TAdditional>, 'queryKey' | 'mapAdditionalProps'>,
	recipe: (draft: Map<string, T>) => void | Promise<void>,
) {
	const data =
		queryClient.getQueryData<MapQueryResult<T, TAdditional>>(queryKey);
	if (data === undefined) return;
	try {
		const map = data.data;
		await recipe(map);
		queryClient.setQueryData<MapQueryResult<T, TAdditional>>(queryKey, {
			data: map,
			// without this field, react-query does not serve change notifications
			forceReload: Math.random(),
			additional: mapAdditionalProps(map, data.additional),
		});
	} catch (ex) {
		console.error(ex);
		await queryClient.invalidateQueries({ queryKey });
	}
}

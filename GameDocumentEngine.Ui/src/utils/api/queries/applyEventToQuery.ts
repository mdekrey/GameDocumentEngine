import type { QueryClient, QueryFunction, QueryKey } from '@tanstack/react-query';
import type { Draft} from 'immer';
import { produce } from 'immer';
import { applyPatch, type Patch } from 'rfc6902';
import type { EntityChangedProps } from '../EntityChangedProps';

/**
 * @returns {undefined|T} Undefined if the cache was invalidated, otherwise the new value of the cache
 */
export async function applyEventToQuery<T>(
	queryClient: QueryClient,
	{ queryKey }: { queryKey: QueryKey; queryFn?: QueryFunction<T> },
	event: EntityChangedProps<unknown, T>,
) {
	if ('patch' in event) {
		return await applyPatchToQuery<T>(queryClient, { queryKey }, event.patch);
	} else if ('value' in event) {
		queryClient.setQueryData(queryKey, event.value);
		return event.value;
	} else {
		await queryClient.invalidateQueries(queryKey);
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
		await queryClient.invalidateQueries(queryKey);
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
		await queryClient.invalidateQueries(queryKey);
	}
}

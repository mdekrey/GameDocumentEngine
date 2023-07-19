import { QueryClient, QueryKey } from '@tanstack/react-query';
import { applyPatch, type Patch } from 'rfc6902';
import { EntityChangedProps } from '../EntityChangedProps';

export async function applyEventToQuery<T>(
	queryClient: QueryClient,
	queryKey: QueryKey,
	event: EntityChangedProps<unknown, T>,
) {
	if ('patch' in event) {
		await applyPatchToQuery(queryClient, queryKey, event.patch);
	} else if ('initialData' in event) {
		queryClient.setQueryData(queryKey, event.initialData);
	} else {
		await queryClient.invalidateQueries(queryKey);
	}
}

export async function applyPatchToQuery<T>(
	queryClient: QueryClient,
	queryKey: QueryKey,
	patch: Patch,
) {
	const data = queryClient.getQueryData<T>(queryKey);
	const result = JSON.parse(JSON.stringify(data)) as T;
	const errors = applyPatch(result, patch);
	if (errors.some((v) => !!v)) {
		await queryClient.invalidateQueries(queryKey);
	} else {
		queryClient.setQueryData(queryKey, result);
	}
}

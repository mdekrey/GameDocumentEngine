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
	} else if ('value' in event) {
		queryClient.setQueryData(queryKey, event.value);
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
	console.log(data, patch);
	const result = JSON.parse(JSON.stringify(data)) as T;
	const errors = applyPatch(result, patch);
	if (errors.some((v) => !!v)) {
		await queryClient.invalidateQueries(queryKey);
	} else {
		queryClient.setQueryData(queryKey, result);
	}
}

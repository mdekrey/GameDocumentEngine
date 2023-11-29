import type {
	FetchQueryOptions,
	QueryClient,
	QueryKey,
	UseMutationOptions,
} from '@tanstack/react-query';
import type { Patch } from 'rfc6902';

export type OperationTransformMutation<T extends { version: string }> =
	UseMutationOptions<T, Error | typeof conflict, Patch, unknown>;

export const conflict = Symbol('conflict');
export type FetchQueryOptionsWithKey<
	TQueryFnData = unknown,
	TError = unknown,
	TData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
> = FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
	queryKey: TQueryKey;
};

export const getPendingActions = <TArgs extends unknown[]>(
	query: (...params: TArgs) => FetchQueryOptionsWithKey,
	...params: TArgs
) =>
	({
		queryKey: [...query(...params).queryKey, 'pendingTransform'] as const,
		queryFn: () => {
			return [] as Patch;
		},
		cacheTime: Number.POSITIVE_INFINITY,
	}) satisfies FetchQueryOptions<Patch>;

export function operationalTransformFromClient<T extends { version: string }>(
	queryClient: QueryClient,
	dataQuery: FetchQueryOptionsWithKey<T>,
	pendingActionsQuery: FetchQueryOptionsWithKey<Patch>,
	mutator: (data: Patch) => Promise<T | typeof conflict>,
): OperationTransformMutation<T> {
	return {
		onMutate: async function queueChanges(changes: Patch) {
			const pendingActions = await queryClient.fetchQuery(pendingActionsQuery);
			// TODO: consolidate with previous pending actions
			const newPatch: Patch = [...pendingActions, ...changes];
			queryClient.setQueryData(pendingActionsQuery.queryKey, newPatch);
		},
		mutationFn: async () => {
			const actualChanges = getChanges();
			if (!actualChanges) return await queryClient.fetchQuery(dataQuery);

			const result = await mutator(actualChanges);
			if (result === conflict) throw conflict;
			queryClient.setQueryData(pendingActionsQuery.queryKey, []);
			return result;
		},
		retry: (failureCount, error) => {
			return error === conflict;
		},
	};

	function getChanges(): Patch | undefined {
		const result = queryClient.getQueryData<Patch>(
			pendingActionsQuery.queryKey,
		);
		if (!result) return undefined;
		return [...getTestPatch(), ...result];
	}

	function getTestPatch(): Patch {
		const version = queryClient.getQueryData<T>(dataQuery.queryKey)?.version;
		return version ? [{ op: 'test', path: '/version', value: version }] : [];
	}
}

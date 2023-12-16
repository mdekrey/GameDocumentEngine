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

export const getPendingActions =
	<TData, TArgs extends unknown[]>(
		query: (...params: TArgs) => FetchQueryOptionsWithKey<TData>,
	) =>
	(...params: TArgs) =>
		({
			queryKey: [...query(...params).queryKey, 'pendingTransform'] as const,
			queryFn: () => {
				return [] as Patch;
			},
			gcTime: Number.POSITIVE_INFINITY,
		}) satisfies FetchQueryOptions<Patch>;

export function operationalTransformFromClient<T extends { version: string }>(
	queryClient: QueryClient,
	dataQuery: FetchQueryOptionsWithKey<T>,
	pendingActionsQuery: FetchQueryOptionsWithKey<Patch>,
	mutator: (data: Patch) => Promise<T | typeof conflict>,
): OperationTransformMutation<T> {
	return {
		onMutate: function queueChanges(changes: Patch) {
			const pendingActions = getCurrentPendingPatches() ?? [];
			// TODO: consolidate with previous pending actions
			const newPatch: Patch = [...pendingActions, ...changes];
			queryClient.setQueryData(pendingActionsQuery.queryKey, newPatch);
		},
		mutationFn: async () => {
			const submittedChanges = getChanges();
			if (!submittedChanges) return await queryClient.fetchQuery(dataQuery);

			const result = await mutator(submittedChanges);
			if (result === conflict) {
				await queryClient.fetchQuery({
					...dataQuery,
					staleTime: 0,
				});
				throw conflict;
			}
			queryClient.setQueryData<T>(dataQuery.queryKey, result);
			queryClient.setQueryData<Patch>(
				pendingActionsQuery.queryKey,
				(prev) =>
					prev?.filter((entry) => !submittedChanges.includes(entry)) ?? [],
			);
			return result;
		},
		retry: (failureCount, error) => {
			return error === conflict;
		},
	};

	function getChanges(): Patch | undefined {
		const result = getCurrentPendingPatches();
		return result && [...getTestPatch(), ...result];
	}

	function getTestPatch(): Patch {
		const version = queryClient.getQueryData<T>(dataQuery.queryKey)?.version;
		return version ? [{ op: 'test', path: '/version', value: version }] : [];
	}

	function getCurrentPendingPatches(): Patch | undefined {
		const result = queryClient.getQueryData<Patch>(
			pendingActionsQuery.queryKey,
		);
		return result;
	}
}

import { QueryClient, UseMutationOptions } from '@tanstack/react-query';
import { applyPatch, type Patch } from 'rfc6902';
import { api } from '../fetch-api';
import { UserDetails } from '@/api/models/UserDetails';

export const getCurrentUser = {
	queryKey: ['currentUser'],
	queryFn: async () => {
		const response = await api.getCurrentUser();
		if (response.statusCode !== 200) return Promise.reject(response);
		return response.data;
	},
};
export async function invalidateCurrentUser(
	queryClient: QueryClient,
	{ key, patch }: { key: string; patch: Patch },
) {
	const currentUserQueryKey = getCurrentUser.queryKey;
	const data = queryClient.getQueryData<UserDetails>(currentUserQueryKey);
	if (data?.id === key) {
		const result = JSON.parse(JSON.stringify(data)) as UserDetails;
		const errors = applyPatch(result, patch);
		if (errors.some((v) => !!v)) {
			await queryClient.invalidateQueries(currentUserQueryKey);
		} else {
			queryClient.setQueryData(currentUserQueryKey, result);
		}
	}
}

export function patchUser(
	queryClient: QueryClient,
): UseMutationOptions<UserDetails, unknown, Patch, unknown> {
	return {
		mutationFn: async (changes: Patch) => {
			const response = await api.patchUser({ body: changes });
			if (response.statusCode === 200) return response.data;
			else if (response.statusCode === 409)
				throw new Error(
					'Other changes were being applied at the same time. Try again later.',
				);
			else throw new Error('Could not save changes');
		},
		onSuccess: (response) => {
			queryClient.setQueryData(getCurrentUser.queryKey, response);
		},
		onError: () => queryClient.invalidateQueries(getCurrentUser.queryKey),
	};
}

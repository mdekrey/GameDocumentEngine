import { QueryClient, UseMutationOptions } from '@tanstack/react-query';
import type { Patch } from 'rfc6902';
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
	{ key }: { key: string },
) {
	const currentUserQueryKey = getCurrentUser.queryKey;
	if (queryClient.getQueryData<UserDetails>(currentUserQueryKey)?.id === key)
		await queryClient.invalidateQueries(currentUserQueryKey);
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

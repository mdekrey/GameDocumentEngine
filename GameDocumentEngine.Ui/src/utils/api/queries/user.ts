import type { QueryClient, UseMutationOptions } from '@tanstack/react-query';
import { type Patch } from 'rfc6902';
import { api } from '../fetch-api';
import type { UserDetails } from '@/api/models/UserDetails';
import { type EntityChangedProps } from '../EntityChangedProps';
import { applyEventToQuery } from './applyEventToQuery';

export const getCurrentUser = {
	queryKey: ['currentUser'],
	queryFn: async () => {
		const response = await api.getCurrentUser();
		if (response.statusCode !== 200) return Promise.reject(response);
		return response.data;
	},
};

export async function handleUserUpdateEvent(
	queryClient: QueryClient,
	event: EntityChangedProps<string, UserDetails>,
) {
	const data = queryClient.getQueryData<UserDetails>(getCurrentUser.queryKey);
	if (data?.id === event.key) {
		await applyEventToQuery(queryClient, getCurrentUser, event);
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
		onError: () => queryClient.invalidateQueries(getCurrentUser.queryKey),
	};
}

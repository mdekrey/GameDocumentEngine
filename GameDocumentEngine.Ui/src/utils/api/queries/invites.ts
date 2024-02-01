import type { QueryClient, UseMutationOptions } from '@tanstack/react-query';
import { api } from '../fetch-api';
import type { GameInvite } from '@vaultvtt/api/openapi/models/GameInvite';
import { produce } from 'immer';

export const listInvitations = (gameId: string) => ({
	queryKey: ['game', gameId, 'invites'],
	queryFn: async () => {
		const response = await api.listInvitations({ params: { gameId } });
		if (response.statusCode !== 200) return Promise.reject(response);
		return response.data;
	},
});

export function createInvitation(
	queryClient: QueryClient,
	gameId: string,
): UseMutationOptions<
	GameInvite,
	unknown,
	{
		role: string;
		uses: number;
	},
	unknown
> {
	return {
		mutationFn: async (invite: { role: string; uses: number }) => {
			const response = await api.createInvitation({
				params: { gameId },
				body: { role: invite.role, uses: invite.uses },
			});
			if (response.statusCode === 200) return response.data;
			else throw new Error('Could not save changes');
		},
		onSuccess: (newInvitation) => {
			const listKey = listInvitations(gameId).queryKey;
			const listData =
				queryClient.getQueryData<Record<string, GameInvite>>(listKey);
			if (listData) {
				queryClient.setQueryData(
					listKey,
					produce(listData, (draft) => {
						draft[newInvitation.id] = newInvitation;
					}),
				);
			}
		},
	};
}

export function cancelInvitation(
	queryClient: QueryClient,
	gameId: string,
): UseMutationOptions<
	void,
	unknown,
	{
		invite: string;
	},
	unknown
> {
	return {
		mutationFn: async ({ invite }) => {
			const response = await api.cancelInvitation({
				params: { linkId: invite },
			});
			if (response.statusCode === 204) return;
			else throw new Error('Could not save changes');
		},
		onSuccess: (_, { invite }) => {
			const listKey = listInvitations(gameId).queryKey;
			const listData =
				queryClient.getQueryData<Record<string, GameInvite>>(listKey);
			if (listData) {
				queryClient.setQueryData(
					listKey,
					produce(listData, (draft) => {
						delete draft[invite];
					}),
				);
			}
		},
	};
}

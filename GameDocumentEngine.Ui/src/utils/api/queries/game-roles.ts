import { UseMutationOptions } from '@tanstack/react-query';
import { api } from '../fetch-api';
import { UserRoleAssignment } from '@/api/models/UserRoleAssignment';

export const getGameRoles = (gameId: string) => ({
	queryKey: ['game', gameId, 'roles'],
	queryFn: async () => {
		const response = await api.getGameRoles({ params: { gameId } });
		if (response.statusCode !== 200) return Promise.reject(response);
		return response.data;
	},
});

export function updateGameRoleAssignments(
	gameId: string,
): UseMutationOptions<
	UserRoleAssignment,
	unknown,
	UserRoleAssignment,
	unknown
> {
	return {
		mutationFn: async (userRoleAssignment) => {
			const response = await api.updateGameRoleAssignments({
				params: { gameId },
				body: userRoleAssignment,
			});
			if (response.statusCode === 200) return response.data;
			else throw new Error('Could not save changes');
		},
	};
}

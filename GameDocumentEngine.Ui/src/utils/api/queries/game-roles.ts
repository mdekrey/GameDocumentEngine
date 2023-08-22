import type { UseMutationOptions } from '@tanstack/react-query';
import { api } from '../fetch-api';

export function updateGameRoleAssignments(
	gameId: string,
): UseMutationOptions<
	{ [Id: string]: string },
	unknown,
	{ [Id: string]: string },
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

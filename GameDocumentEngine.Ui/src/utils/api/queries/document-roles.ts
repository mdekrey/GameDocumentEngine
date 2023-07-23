import { UseMutationOptions } from '@tanstack/react-query';
import { api } from '../fetch-api';

export function updateDocumentRoleAssignments(
	gameId: string,
	documentId: string,
): UseMutationOptions<
	{ [Id: string]: string },
	unknown,
	{ [Id: string]: string | null },
	unknown
> {
	return {
		mutationFn: async (userRoleAssignment) => {
			const response = await api.updateDocumentRoleAssignments({
				params: { gameId, id: documentId },
				body: userRoleAssignment,
			});
			if (response.statusCode === 200) return response.data;
			else throw new Error('Could not save changes');
		},
	};
}

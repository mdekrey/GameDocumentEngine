import { QueryClient, UseMutationOptions } from '@tanstack/react-query';
import { CreateDocumentDetails } from '@/api/models/CreateDocumentDetails';
import { api } from '../fetch-api';
import { NavigateFunction } from 'react-router-dom';
import { DocumentDetailsWithId } from '@/api/models/DocumentDetailsWithId';

export const listDocuments = (gameId: string) => ({
	queryKey: ['game', gameId, 'document'],
	queryFn: async () => {
		// TODO: this is currently not paginated, but neither is the server-side.
		const response = await api.listDocuments({ params: { gameId } });
		if (response.statusCode !== 200) return Promise.reject(response);
		return response.data;
	},
});

export const getDocument = (gameId: string, documentId: string) => {
	const result = {
		queryKey: ['game', gameId, 'document', documentId] as const,
		queryFn: () => api.getDocument({ params: { gameId, id: documentId } }),
	};
	return result;
};

export function createDocument(
	queryClient: QueryClient,
	navigate: NavigateFunction,
	gameId: string,
): UseMutationOptions<
	DocumentDetailsWithId,
	unknown,
	{ document: CreateDocumentDetails },
	unknown
> {
	return {
		mutationFn: async ({ document }) => {
			const response = await api.createDocument({
				params: { gameId },
				body: document,
			});
			if (response.statusCode === 200) return response.data;
			else throw new Error('Could not save changes');
		},
		onSuccess: async ({ id }) => {
			await queryClient.invalidateQueries(listDocuments(gameId).queryKey);
			navigate(`/game/${gameId}/document/${id}`);
			// TODO: invalidate game list
			// queryClient.invalidateQueries();
			// TODO: redirect to game landing page
		},
	};
}

export function deleteDocument(
	queryClient: QueryClient,
): UseMutationOptions<
	undefined,
	unknown,
	{ gameId: string; id: string },
	unknown
> {
	return {
		mutationFn: async ({ gameId, id }) => {
			const response = await api.deleteDocument({ params: { gameId, id } });
			if (response.statusCode === 200) return undefined;
			else throw new Error('Could not save changes');
		},
		onSuccess: async (_, { gameId }) => {
			await queryClient.invalidateQueries(listDocuments(gameId).queryKey);
		},
	};
}

export const patchDocument = {};

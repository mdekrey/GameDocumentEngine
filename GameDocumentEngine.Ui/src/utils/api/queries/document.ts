import { QueryClient, UseMutationOptions } from '@tanstack/react-query';
import { CreateDocumentDetails } from '@/api/models/CreateDocumentDetails';
import { api } from '../fetch-api';
import { NavigateFunction } from 'react-router-dom';
import { DocumentDetails } from '@/api/models/DocumentDetails';
import { Patch } from 'rfc6902';

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
		queryFn: async () => {
			const response = await api.getDocument({
				params: { gameId, id: documentId },
			});
			if (response.statusCode !== 200) return Promise.reject(response);
			return response.data;
		},
	};
	return result;
};

export function createDocument(
	queryClient: QueryClient,
	navigate: NavigateFunction,
	gameId: string,
): UseMutationOptions<
	DocumentDetails,
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
		onSuccess: async (document) => {
			queryClient.setQueryData(
				getDocument(gameId, document.id).queryKey,
				document,
			);
			await queryClient.invalidateQueries(listDocuments(gameId).queryKey);
			navigate(`/game/${gameId}/document/${document.id}`);
			// TODO: invalidate game list
			// queryClient.invalidateQueries();
			// TODO: redirect to game landing page
		},
	};
}

export function deleteDocument(
	queryClient: QueryClient,
	gameId: string,
	documentId: string,
): UseMutationOptions<undefined, unknown, void, unknown> {
	return {
		mutationFn: async () => {
			const response = await api.deleteDocument({
				params: { gameId, id: documentId },
			});
			if (response.statusCode === 200) return undefined;
			else throw new Error('Could not save changes');
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries(listDocuments(gameId).queryKey);
			await queryClient.invalidateQueries(
				getDocument(gameId, documentId).queryKey,
			);
		},
	};
}

export function patchDocument(
	queryClient: QueryClient,
	gameId: string,
	documentId: string,
): UseMutationOptions<DocumentDetails, unknown, Patch, unknown> {
	return {
		mutationFn: async (changes: Patch) => {
			const response = await api.patchDocument({
				params: { gameId, id: documentId },
				body: changes,
			});
			if (response.statusCode === 200) return response.data;
			else if (response.statusCode === 409)
				throw new Error(
					'Other changes were being applied at the same time. Try again later.',
				);
			else throw new Error('Could not save changes');
		},
		onSuccess: (response) => {
			queryClient.setQueryData(
				getDocument(gameId, documentId).queryKey,
				response,
			);
		},
		onError: async () => {
			await queryClient.invalidateQueries(
				getDocument(gameId, documentId).queryKey,
			);
		},
	};
}

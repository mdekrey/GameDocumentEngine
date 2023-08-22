import type { QueryClient, UseMutationOptions } from '@tanstack/react-query';
import type { CreateDocumentDetails } from '@/api/models/CreateDocumentDetails';
import { api } from '../fetch-api';
import type { NavigateFunction } from 'react-router-dom';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { Patch } from 'rfc6902';
import type { EntityChangedProps } from '../EntityChangedProps';
import {
	applyChangeToQuery,
	applyEventToQuery,
	applyPatchToQuery,
} from './applyEventToQuery';

export const listDocuments = (gameId: string) => ({
	queryKey: ['game', gameId, 'document', 'list'],
	queryFn: async () => {
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

export async function handleDocumentUpdateEvent(
	queryClient: QueryClient,
	event: EntityChangedProps<{ gameId: string; id: string }, DocumentDetails>,
) {
	const query = getDocument(event.key.gameId, event.key.id);
	const resultData = await applyEventToQuery(queryClient, query, event);

	const listQuery = listDocuments(event.key.gameId);

	if ('removed' in event && event.removed) {
		await applyPatchToQuery(queryClient, listQuery, [
			{ path: `/${event.key.id}`, op: 'remove' },
		]);
	} else if (resultData) {
		await applyChangeToQuery(queryClient, listQuery, (list) => {
			list[event.key.id] = {
				id: event.key.id,
				name: resultData.name,
				type: resultData.type,
			};
		});
	} else {
		await queryClient.invalidateQueries(listQuery);
	}
}

export function createDocument(
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
		onSuccess: (document) => {
			navigate(`/game/${gameId}/document/${document.id}`);
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
		onError: async () => {
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
		onError: async () => {
			await queryClient.invalidateQueries(
				getDocument(gameId, documentId).queryKey,
			);
		},
	};
}

import type { QueryClient, UseMutationOptions } from '@tanstack/react-query';
import type { CreateDocumentDetails } from '@/api/models/CreateDocumentDetails';
import { api } from '../fetch-api';
import type { NavigateFunction } from 'react-router-dom';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { Patch } from 'rfc6902';
import type { EntityChangedProps } from '../EntityChangedProps';
import type { MapQueryConfig } from './applyEventToQuery';
import { applyEventToQuery, applyChangeToMapQuery } from './applyEventToQuery';
import type { DocumentSummary } from '@/api/models/DocumentSummary';

export type FolderNode = {
	/** Undefined if in an unknown loop */
	path?: (string | null)[];
	childrenIds: string[];
};
export type AllFolderData = {
	unrootedFolderIds: string[];
	/** Mapping of all folders to their children */
	hierarchy: Map<string | null, FolderNode>;
};
export const listDocuments = (
	gameId: string,
): MapQueryConfig<DocumentSummary, AllFolderData> => {
	return {
		queryKey: ['game', gameId, 'document', 'list'],
		queryFn: async ({ signal }) => {
			const response = await api.listDocuments({ params: { gameId } });
			if (response.statusCode !== 200) return Promise.reject(response);
			const result = new Map(Object.entries(response.data.data));

			void (async () => {
				let nextCursor = response.data.pagination.nextCursor;
				while (nextCursor) {
					if (signal?.aborted) return;
					const response = await api.listDocuments({
						params: { gameId, cursor: nextCursor },
					});
					if (response.statusCode !== 200) return;
					nextCursor = response.data.pagination.nextCursor;
					for (const kvp of Object.entries(response.data.data)) {
						result.set(...kvp);
					}
				}
			})();

			return { data: result, additional: mapDocumentsToFolders(result) };
		},
		mapAdditionalProps: mapDocumentsToFolders,
	};
};

function mapDocumentsToFolders(
	documents: Map<string, DocumentSummary>,
): AllFolderData {
	const unrootedFolderIds = new Set<string>(documents.keys());
	const hierarchy: AllFolderData['hierarchy'] = new Map();
	const rootedQueue: (string | null)[] = [null];

	for (const doc of documents.values()) {
		const parent = hierarchy.get(doc.folderId) ?? createEmptyNode();
		hierarchy.set(doc.folderId, parent);
		if (doc.folderId === null && !parent.path) parent.path = [];
		parent.childrenIds.push(doc.id);
	}
	let nextId: string | null | undefined;
	while ((nextId = rootedQueue.pop()) !== undefined) {
		const nextFolder = hierarchy.get(nextId);
		if (!nextFolder) continue;
		for (const childId of nextFolder.childrenIds) {
			const child = documents.get(childId);
			if (!child) throw new Error('unknown document found');
			setRoot(child, nextFolder);
		}
	}

	// TODO: consider walking through unrootedFolderIds to get partial folder structures

	return {
		unrootedFolderIds: Array.from(unrootedFolderIds.values()),
		hierarchy,
	};

	function createEmptyNode(): FolderNode {
		return { childrenIds: [] };
	}

	function setRoot(doc: DocumentSummary, parent: FolderNode) {
		if (!parent?.path) throw new Error(`invalid root for ${doc.id}`);
		unrootedFolderIds.delete(doc.id);
		rootedQueue.push(doc.id);
		const selfFolder = hierarchy.get(doc.id);
		if (!selfFolder) return;
		selfFolder.path = [...parent.path, doc.folderId];
	}
}

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
		await applyChangeToMapQuery(queryClient, listQuery, (map) =>
			map.delete(event.key.id),
		);
	} else if (resultData) {
		await applyChangeToMapQuery(queryClient, listQuery, (map) => {
			map.set(event.key.id, {
				...resultData,
				id: event.key.id,
			});
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

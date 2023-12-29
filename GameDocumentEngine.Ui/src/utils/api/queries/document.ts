import type { QueryClient, UseMutationOptions } from '@tanstack/react-query';
import type { CreateDocumentDetails } from '@/api/models/CreateDocumentDetails';
import { api } from '../fetch-api';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { EntityChangedProps } from '../EntityChangedProps';
import type { MapQueryConfig } from './applyEventToQuery';
import { applyEventToQuery, applyChangeToMapQuery } from './applyEventToQuery';
import type { DocumentSummary } from '@/api/models/DocumentSummary';
import type { OperationTransformMutation } from './operational-transform';
import {
	conflict,
	getPendingActions,
	operationalTransformFromClient,
} from './operational-transform';
import { applyPatch } from 'rfc6902';
import { produce } from 'immer';

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
		const current = hierarchy.get(doc.id) ?? createEmptyNode();
		hierarchy.set(doc.id, current);
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

export const getDocument = (gameId: string, documentId: string) => ({
	queryKey: ['game', gameId, 'document', documentId] as const,
	queryFn: async () => {
		const response = await api.getDocument({
			params: { gameId, id: documentId },
		});
		if (response.statusCode !== 200) return Promise.reject(response);
		return response.data;
	},
});
export const getDocumentPendingActions = getPendingActions(getDocument);

export async function handleDocumentUpdateEvent(
	queryClient: QueryClient,
	event: EntityChangedProps<{ gameId: string; id: string }, DocumentDetails>,
) {
	const query = getDocument(event.key.gameId, event.key.id);
	// TODO: operational transform
	const resultData = await applyEventToQuery(queryClient, query, event);

	const listQuery = listDocuments(event.key.gameId);

	if ('removed' in event && event.removed) {
		await applyChangeToMapQuery(
			queryClient,
			listQuery,
			(map) => void map.delete(event.key.id),
		);
		return;
	}

	await applyChangeToMapQuery(queryClient, listQuery, async (map) => {
		if (resultData) {
			map.set(event.key.id, {
				...resultData,
				id: event.key.id,
			});
			return;
		}
		if ('patch' in event) {
			const prev = map.get(event.key.id);
			if (!prev) throw new Error('unknown entry');
			map.set(
				event.key.id,
				produce(prev, (d) => {
					applyPatch(d, event.patch);
				}),
			);
		} else {
			await queryClient.invalidateQueries(listQuery);
		}
	});
}

export function createDocument(
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
			await queryClient.resetQueries(listDocuments(gameId));
			await queryClient.resetQueries(getDocument(gameId, documentId));
		},
	};
}

export function patchDocument(
	queryClient: QueryClient,
	gameId: string,
	documentId: string,
): OperationTransformMutation<DocumentDetails> {
	return operationalTransformFromClient(
		queryClient,
		getDocument(gameId, documentId),
		getDocumentPendingActions(gameId, documentId),
		async (patch) => {
			const response = await api.patchDocument({
				params: { gameId, id: documentId },
				body: patch,
			});
			if (response.statusCode === 200) return response.data;
			else if (response.statusCode === 409) return conflict;
			else throw new Error('Could not save changes');
		},
	);
}

export function changeDocumentFolder(
	queryClient: QueryClient,
	gameId: string,
): UseMutationOptions<
	DocumentDetails,
	unknown,
	{ id: string; folderId?: string },
	unknown
> {
	// TODO: operational transform
	return {
		mutationFn: async ({ id, folderId }) => {
			const response = await api.patchDocument({
				params: { gameId, id },
				body: [
					folderId
						? { op: 'replace', path: '/folderId', value: folderId }
						: { op: 'remove', path: '/folderId' },
				],
			});
			if (response.statusCode === 200) return response.data;
			else if (response.statusCode === 409)
				throw new Error(
					'Other changes were being applied at the same time. Try again later.',
				);
			else throw new Error('Could not save changes');
		},
		onError: async (err, { id }) => {
			await queryClient.invalidateQueries(getDocument(gameId, id));
		},
	};
}

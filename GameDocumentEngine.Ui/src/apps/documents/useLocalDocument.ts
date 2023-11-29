import { queries } from '@/utils/api/queries';
import { getDocumentPendingActions } from '@/utils/api/queries/document';
import type { QueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { produce } from 'immer';
import type { Patch } from 'rfc6902';
import { applyPatch } from 'rfc6902';
import type { DocumentDetails } from '@/api/models/DocumentDetails';

function combinePendingActions(pendingActions: Patch) {
	return <T>(rawData: T) => {
		return produce(rawData, (draft) => {
			applyPatch(draft, pendingActions);
		});
	};
}

const emptyPendingActions = [] as Patch;
export function useLocalDocument(gameId: string, documentId: string) {
	const documentPendingUpdates = useQuery(
		getDocumentPendingActions(gameId, documentId),
	);
	const pendingActions = documentPendingUpdates.data ?? emptyPendingActions;
	const documentResult = useQuery({
		...queries.getDocument(gameId, documentId),
		select: useCallback(
			(rawData: DocumentDetails) =>
				combinePendingActions(pendingActions)(rawData),
			[pendingActions],
		),
	});

	return documentResult;
}

export async function fetchLocalDocument(
	queryClient: QueryClient,
	gameId: string,
	documentId: string,
) {
	const pendingActions = await queryClient.fetchQuery(
		getDocumentPendingActions(gameId, documentId),
	);
	const latestDocData = await queryClient.fetchQuery(
		queries.getDocument(gameId, documentId),
	);
	return combinePendingActions(pendingActions)(latestDocData);
}

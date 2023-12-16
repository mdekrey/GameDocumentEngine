import { queries } from '@/utils/api/queries';
import { getDocumentPendingActions } from '@/utils/api/queries/document';
import type { QueryClient } from '@tanstack/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { produce } from 'immer';
import type { Patch } from 'rfc6902';
import { applyPatch } from 'rfc6902';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import { fetchDocument } from '@/utils/api/loaders';

function combinePendingActions(pendingActions: Patch) {
	return <T>(rawData: T) => {
		return produce(rawData, (draft) => {
			applyPatch(draft, pendingActions);
		});
	};
}

export function useLocalDocument(gameId: string, documentId: string) {
	const pendingActions = useSuspenseQuery(
		getDocumentPendingActions(gameId, documentId),
	).data;
	const documentResult = useSuspenseQuery({
		...queries.getDocument(gameId, documentId),
		select: useCallback(
			(rawData: DocumentDetails) =>
				combinePendingActions(pendingActions)(rawData),
			[pendingActions],
		),
	}).data;

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
	const latestDocData = await fetchDocument(queryClient, gameId, documentId);
	return combinePendingActions(pendingActions)(latestDocData);
}

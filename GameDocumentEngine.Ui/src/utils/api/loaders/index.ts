import type { QueryClient } from '@tanstack/react-query';
import type { GameTypeScripts } from '../queries/game-types';
import { queries } from '../queries';
import { getGameTypeScripts } from '../queries/game-types';
import { getDocumentType, getWidgetType } from '../accessors';

export async function fetchGame(queryClient: QueryClient, gameId: string) {
	return await queryClient.fetchQuery(queries.getGameDetails(gameId));
}

export async function fetchGameType(
	queryClient: QueryClient,
	gameId: string,
): Promise<GameTypeScripts> {
	const game = await fetchGame(queryClient, gameId);
	return await queryClient.fetchQuery(
		getGameTypeScripts(game.typeInfo.key ?? 'none', queryClient),
	);
}

export async function fetchDocument(
	queryClient: QueryClient,
	gameId: string,
	documentId: string,
) {
	return await queryClient.fetchQuery(queries.getDocument(gameId, documentId));
}

export async function fetchDocumentType(
	queryClient: QueryClient,
	gameId: string,
	documentId: string,
) {
	const gameType = await fetchGameType(queryClient, gameId);
	const document = await fetchDocument(queryClient, gameId, documentId);
	return getDocumentType(gameType, document.type);
}

export async function fetchWidgetType(
	queryClient: QueryClient,
	gameId: string,
	documentId: string,
	widgetType: string,
) {
	const docType = await fetchDocumentType(queryClient, gameId, documentId);
	return getWidgetType(docType, widgetType);
}

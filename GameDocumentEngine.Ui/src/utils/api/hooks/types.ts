import type { GameTypeScripts } from '../queries/game-types';
import { getGameTypeScripts } from '../queries/game-types';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { getDocumentType, getWidgetType } from '../accessors';
import { useDocument, useGame } from './data';

export function useGameType(gameId: string): GameTypeScripts {
	const queryClient = useQueryClient();
	const game = useGame(gameId);
	return useSuspenseQuery(
		getGameTypeScripts(game.typeInfo.key ?? 'none', queryClient),
	).data;
}

export function useDocumentType(gameId: string, documentId: string) {
	const gameType = useGameType(gameId);
	const doc = useDocument(gameId, documentId);
	return getDocumentType(gameType, doc.type);
}

export function useWidgetType(
	gameId: string,
	documentId: string,
	widgetType: string,
) {
	const docType = useDocumentType(gameId, documentId);
	return getWidgetType(docType, widgetType);
}

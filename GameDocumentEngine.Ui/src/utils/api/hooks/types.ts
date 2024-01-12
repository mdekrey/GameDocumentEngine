import type { GameTypeScripts } from '../queries/game-types';
import { getGameTypeScripts } from '../queries/game-types';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { getDocumentType, getWidgetType } from '../accessors';
import { useDocument, useGame } from './data';
import type {
	GameObjectWidgetDefinition,
	TypedDocumentDetails,
	WidgetBase,
} from '@/documents/defineDocument';

export function useGameType(gameId: string): GameTypeScripts {
	const queryClient = useQueryClient();
	const game = useGame(gameId);
	return useSuspenseQuery(
		getGameTypeScripts(game.typeInfo.key ?? 'none', queryClient),
	).data;
}

export function useTypeOfDocument<T>(document: TypedDocumentDetails<T>) {
	return useDocumentType<T>(document.gameId, document.id);
}

export function useDocumentTypeKey(gameId: string, documentId: string) {
	return useDocument(gameId, documentId).type;
}

export function useDocumentType<T = unknown>(
	gameId: string,
	documentId: string,
) {
	const gameType = useGameType(gameId);
	const docType = useDocumentTypeKey(gameId, documentId);
	return getDocumentType<T>(gameType, docType);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useWidgetType<T = unknown, TWidget extends WidgetBase = any>(
	gameId: string,
	documentId: string,
	widgetType: string,
) {
	const docType = useDocumentType(gameId, documentId);
	return getWidgetType(docType, widgetType) as GameObjectWidgetDefinition<
		T,
		TWidget
	>;
}

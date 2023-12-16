import { useSuspenseQuery } from '@tanstack/react-query';
import { queries } from '../queries';
import { useGameType } from './useGameType';
import {
	defaultMissingWidgetDefinition,
	missingDocumentType,
} from '@/documents/defaultMissingWidgetDefinition';
import type {
	GameTypeObjectScripts,
	GameTypeScripts,
} from '../queries/game-types';

export * from './useGameType';

export function useDocument(gameId: string, documentId: string) {
	return useSuspenseQuery(queries.getDocument(gameId, documentId)).data;
}

export function getDocumentType(gameType: GameTypeScripts, docType: string) {
	return gameType.objectTypes[docType] ?? missingDocumentType;
}

export function useDocumentType(gameId: string, documentId: string) {
	const gameType = useGameType(gameId);
	const doc = useDocument(gameId, documentId);
	return getDocumentType(gameType, doc.type);
}

export function getWidgetType(
	documentType: GameTypeObjectScripts,
	widgetType: string,
) {
	return (
		documentType.typeInfo.widgets?.[widgetType] ??
		defaultMissingWidgetDefinition
	);
}

export function useWidgetType(
	gameId: string,
	documentId: string,
	widgetType: string,
) {
	const docType = useDocumentType(gameId, documentId);
	return (
		docType.typeInfo.widgets?.[widgetType] ?? defaultMissingWidgetDefinition
	);
}

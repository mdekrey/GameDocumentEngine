import { defaultMissingWidgetDefinition } from '@/documents/defaultMissingWidgetDefinition';
import type {
	GameTypeObjectScripts,
	GameTypeScripts,
} from '../queries/game-types';

export function getDocumentType<T = unknown>(
	gameType: GameTypeScripts,
	docType: string,
): GameTypeObjectScripts<T> | undefined {
	return gameType.objectTypes[docType] as GameTypeObjectScripts<T>;
}

export function getWidgetType(
	documentType: GameTypeObjectScripts | undefined,
	widgetType: string,
) {
	return (
		documentType?.typeInfo.widgets?.[widgetType] ??
		defaultMissingWidgetDefinition
	);
}

export function getDocTypeTranslationNamespace(docType: string) {
	return `doc-types:${docType}`;
}
export function getGameTypeTranslationNamespace(docType: string) {
	return `game-types:${docType}`;
}

import {
	defaultMissingWidgetDefinition,
	missingDocumentType,
} from '@/documents/defaultMissingWidgetDefinition';
import type {
	GameTypeObjectScripts,
	GameTypeScripts,
} from '../queries/game-types';

export function getDocumentType<T = unknown>(
	gameType: GameTypeScripts,
	docType: string,
) {
	return (gameType.objectTypes[docType] ??
		missingDocumentType) as GameTypeObjectScripts<T>;
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

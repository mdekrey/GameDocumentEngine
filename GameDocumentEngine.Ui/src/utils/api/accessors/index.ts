import { defaultMissingWidgetDefinition } from '@/documents/defaultMissingWidgetDefinition';
import type {
	GameTypeObjectScripts,
	GameTypeScripts,
} from '../queries/game-types';
import type { Namespace, TFunction } from 'i18next';
import { i18n } from '@/utils/i18n/setup';
import type { GameObjectWidgetDefinition } from '@/documents/defineDocument';

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

export function getDocTypeTranslationNamespace(docType: string): string;
export function getDocTypeTranslationNamespace(
	docType?: string,
): string | undefined;
export function getDocTypeTranslationNamespace(docType?: string) {
	return docType && `doc-types:${docType}`;
}

export function getGameTypeTranslationNamespace(docType: string) {
	return `game-types:${docType}`;
}

export function getWidgetTypeTranslation(
	docType: GameTypeObjectScripts | undefined,
	widgetType: GameObjectWidgetDefinition,
) {
	return {
		namespace:
			widgetType.translationNamespace ??
			getDocTypeTranslationNamespace(docType?.key) ??
			'unknown-widget',
		keyPrefix: widgetType.translationKeyPrefix,
	};
}

export async function loadTranslation<Ns extends Namespace>(
	ns: Ns,
	keyPrefix?: string,
): Promise<TFunction<Ns>> {
	await i18n.loadNamespaces(ns);
	return i18n.getFixedT(i18n.languages, ns, keyPrefix);
}

import type { DocumentDetails } from '@vaultvtt/api/openapi/models/DocumentDetails';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useDocumentType } from './types';
import {
	getDocTypeTranslationNamespace,
	getGameTypeTranslationNamespace,
	getWidgetType,
	getWidgetTypeTranslation,
} from '../accessors';
import { useGame } from './data';

type TranslationOptions = Parameters<typeof useTranslation>[1];

export function useDocTypeTranslation(
	docType: string,
	options?: TranslationOptions,
) {
	return useTranslation(getDocTypeTranslationNamespace(docType), options).t;
}
export function useTranslationForGame(
	gameId: string,
	options?: TranslationOptions,
): TFunction {
	const game = useGame(gameId);
	return useTranslation(
		getGameTypeTranslationNamespace(game.typeInfo.key),
		options,
	).t;
}

export function useTranslationFor(
	gameId: string,
	documentId: string,
	optionsOrWidgetType?: string | TranslationOptions,
) {
	const docType = useDocumentType(gameId, documentId);
	const widgetType =
		typeof optionsOrWidgetType === 'string'
			? getWidgetType(docType, optionsOrWidgetType)
			: null;

	const params: Parameters<typeof useTranslation> = (function () {
		if (widgetType) {
			const { namespace, keyPrefix } = getWidgetTypeTranslation(
				docType,
				widgetType,
			);
			return [namespace, { keyPrefix }];
		}
		return [
			getDocTypeTranslationNamespace(docType?.key),
			typeof optionsOrWidgetType === 'object' ? optionsOrWidgetType : undefined,
		];
	})();

	return useTranslation(...params).t;
}

export function useTranslationForDocument(
	document: DocumentDetails,
	widgetTypeKey?: string | Parameters<typeof useTranslation>[1],
): TFunction {
	return useTranslationFor(document.gameId, document.id, widgetTypeKey);
}

import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useDocumentType } from './types';
import {
	getDocTypeTranslationNamespace,
	getGameTypeTranslationNamespace,
	getWidgetType,
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
	options?: string | TranslationOptions,
) {
	const docType = useDocumentType(gameId, documentId);
	const widgetType =
		typeof options === 'string' ? getWidgetType(docType, options) : null;

	const params: Parameters<typeof useTranslation> = widgetType
		? [
				widgetType.translationNamespace ??
					getDocTypeTranslationNamespace(docType.key),
				{
					keyPrefix: widgetType.translationKeyPrefix,
				},
		  ]
		: [
				getDocTypeTranslationNamespace(docType.key),
				typeof options === 'object' ? options : undefined,
		  ];

	return useTranslation(...params).t;
}

export function useTranslationForDocument(
	document: DocumentDetails,
	widgetTypeKey?: string | Parameters<typeof useTranslation>[1],
): TFunction {
	return useTranslationFor(document.gameId, document.id, widgetTypeKey);
}

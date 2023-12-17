import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useDocumentType } from './types';
import { getWidgetType } from '../accessors';

function getDocTypeTranslationNamespace(docType: string) {
	return `doc-types:${docType}`;
}

export function useDocTypeTranslation(docType: string) {
	return useTranslation(getDocTypeTranslationNamespace(docType)).t;
}

export function useTranslationFor(
	gameId: string,
	documentId: string,
	widgetTypeKey?: string,
) {
	const docType = useDocumentType(gameId, documentId);
	const widgetType = widgetTypeKey
		? getWidgetType(docType, widgetTypeKey)
		: null;

	const params: Parameters<typeof useTranslation> = widgetType
		? [
				widgetType.translationNamespace ??
					getDocTypeTranslationNamespace(docType.key),
				{
					keyPrefix: widgetType.translationKeyPrefix,
				},
		  ]
		: [getDocTypeTranslationNamespace(docType.key)];

	return useTranslation(...params).t;
}

export function useTranslationForDocument(
	document: DocumentDetails,
	widgetTypeKey?: string,
): TFunction {
	return useTranslationFor(document.gameId, document.id, widgetTypeKey);
}

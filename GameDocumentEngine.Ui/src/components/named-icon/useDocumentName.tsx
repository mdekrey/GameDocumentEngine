import { missingDocumentType } from '@/documents/defaultMissingWidgetDefinition';
import {
	useDocument,
	useDocumentType,
	useTranslationFor,
} from '@/utils/api/hooks';
import { NamedIcon } from './NamedIcon';
import { useCallback } from 'react';

export function useDocumentName(gameId: string, documentId: string) {
	const document = useDocument(gameId, documentId);
	const { icon: Icon } =
		useDocumentType(document.gameId, document.id)?.typeInfo ??
		missingDocumentType;
	const tDocument = useTranslationFor(document.gameId, document.id);

	return useCallback(
		function DocumentName() {
			return (
				<NamedIcon
					name={document.name}
					icon={Icon}
					typeName={tDocument('name')}
				/>
			);
		},
		[Icon, document.name, tDocument],
	);
}

import { type EditableDocumentDetails } from '@/documents/defineDocument';
import { useMemo } from 'react';
import { toEditableDetails } from '@/documents/get-document-pointers';
import type { FieldMapping } from '@/utils/form';
import type { DocumentDetails } from '@/api/models/DocumentDetails';

export function useEditableDocument<T>(
	document: DocumentDetails,
	fixup: FieldMapping<EditableDocumentDetails<T>, EditableDocumentDetails<T>>,
) {
	return useMemo(() => toEditableDetails(document, fixup), [document, fixup]);
}

import { useAllDocuments } from '@/utils/api/hooks';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import {
	NotSelected,
	SelectField,
} from '@/components/form-fields/select-input/select-field';

export function SelectDocumentByType({
	gameId,
	docType,
	field,
}: {
	gameId: string;
	docType: string;
	field: FormFieldReturnType<string>;
}) {
	const allDocs = useAllDocuments(gameId);
	const previewableDocs = Array.from(allDocs.data.values()).filter(
		(d) => d.type == docType,
	);
	return (
		<SelectField items={previewableDocs.map((d) => d.id)} field={field}>
			{(id) =>
				id ? (
					<>{previewableDocs.find((d) => d.id === id)?.name}</>
				) : (
					<NotSelected>{field.translation('not-selected')}</NotSelected>
				)
			}
		</SelectField>
	);
}

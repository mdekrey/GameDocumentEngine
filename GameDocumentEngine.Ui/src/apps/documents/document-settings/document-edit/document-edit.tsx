import { Button } from '@/components/button/button';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { queries } from '@/utils/api/queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { produceWithPatches } from 'immer';
import type { StandardField } from '@/components/form-fields/FieldProps';
import { immerPatchToStandard } from '@/utils/api/immerPatchToStandard';
import { z } from 'zod';
import { useForm } from '@/utils/form';
import { ButtonRow } from '@/components/button/button-row';
import { updateFormDefault } from '@/utils/form';
import { useTranslation } from 'react-i18next';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { hasDocumentPermission } from '@/utils/security/match-permission';
import { writeDocumentDetailsPrefix } from '@/utils/security/permission-strings';
import type { DocumentSummary } from '@/api/models/DocumentSummary';
import { SelectField } from '@/components/form-fields/select-input/select-field';
import { useAllDocuments, useDocument } from '@/utils/api/hooks';

function usePatchDocument(gameId: string, documentId: string) {
	const queryClient = useQueryClient();
	return useMutation(queries.patchDocument(queryClient, gameId, documentId));
}

export function DocumentEditFields({
	name,
	folderId,
	canEdit,
	allFolders,
}: {
	name: StandardField<string>;
	folderId: StandardField<string | null>;
	canEdit: boolean;
	allFolders: Map<string, DocumentSummary>;
}) {
	const { t } = useTranslation(['edit-document']);
	return (
		<Fieldset>
			<TextField field={name} />
			<SelectField field={folderId} items={[null, ...allFolders.keys()]}>
				{(anyFolderId) =>
					anyFolderId === null
						? folderId.translation('root')
						: allFolders.get(anyFolderId)?.name
				}
			</SelectField>
			{canEdit && (
				<ButtonRow>
					<Button type="submit">{t('submit')}</Button>
				</ButtonRow>
			)}
		</Fieldset>
	);
}

const DocumentDetailsSchema = z.object({
	name: z.string().min(1),
	folderId: z.string().nullable(),
});

export function DocumentEdit({
	gameId,
	documentId,
}: {
	gameId: string;
	documentId: string;
}) {
	const { t } = useTranslation(['edit-document']);
	const documentForm = useForm({
		defaultValue: { name: '', folderId: null },
		translation: t,
		schema: DocumentDetailsSchema,
		fields: {
			name: ['name'],
			folderId: ['folderId'],
		},
	});

	const documentsList = useAllDocuments(gameId);
	const documentData = useDocument(gameId, documentId);
	const saveDocument = usePatchDocument(gameId, documentId);

	updateFormDefault(documentForm, documentData);
	const canEdit = hasDocumentPermission(
		documentData,
		writeDocumentDetailsPrefix,
	);
	documentForm.store.set(documentForm.readOnlyFields, !canEdit);

	return (
		<form onSubmit={documentForm.handleSubmit(onSubmit)}>
			<DocumentEditFields
				{...documentForm.fields}
				canEdit={canEdit}
				allFolders={documentsList.data}
			/>
		</form>
	);

	function onSubmit(currentValue: z.infer<typeof DocumentDetailsSchema>) {
		const patches = produceWithPatches(documentData, (draft) => {
			draft.name = currentValue.name;
			draft.folderId = currentValue.folderId;
		})[1];
		if (patches.length > 0)
			saveDocument.mutate(patches.map(immerPatchToStandard));
	}
}

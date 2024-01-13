import { Button } from '@/components/button/button';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { queries } from '@/utils/api/queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { produceWithPatches } from 'immer';
import { immerPatchToStandard } from '@/utils/api/immerPatchToStandard';
import { z } from 'zod';
import { useForm, useUpdatingForm } from '@/utils/form';
import { ButtonRow } from '@/components/button/button-row';
import { useTranslation } from 'react-i18next';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { hasDocumentPermission } from '@/utils/security/match-permission';
import { writeDocumentDetailsPrefix } from '@/utils/security/permission-strings';
import { SelectField } from '@/components/form-fields/select-input/select-field';
import { useAllDocuments, useDocument } from '@/utils/api/hooks';

function usePatchDocument(gameId: string, documentId: string) {
	const queryClient = useQueryClient();
	return useMutation(queries.patchDocument(queryClient, gameId, documentId));
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
	const documentData = useDocument(gameId, documentId);
	const documentForm = useForm({
		defaultValue: { name: documentData.name, folderId: documentData.folderId },
		translation: t,
		schema: DocumentDetailsSchema,
		fields: {
			name: ['name'],
			folderId: ['folderId'],
		},
	});

	const documentsList = useAllDocuments(gameId);
	const saveDocument = usePatchDocument(gameId, documentId);

	useUpdatingForm(documentForm, documentData);
	const canEdit = hasDocumentPermission(
		documentData,
		writeDocumentDetailsPrefix,
	);
	documentForm.store.set(documentForm.readOnlyFields, !canEdit);

	const allFolders = documentsList.data;

	return (
		<form onSubmit={documentForm.handleSubmit(onSubmit)}>
			<Fieldset>
				<TextField field={documentForm.fields.name} />
				<SelectField
					field={documentForm.fields.folderId}
					items={[null, ...allFolders.keys()]}
				>
					{(anyFolderId) =>
						anyFolderId === null
							? documentForm.fields.folderId.translation('root')
							: allFolders.get(anyFolderId)?.name
					}
				</SelectField>
				{canEdit && (
					<ButtonRow>
						<Button type="submit">{t('submit')}</Button>
					</ButtonRow>
				)}
			</Fieldset>
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

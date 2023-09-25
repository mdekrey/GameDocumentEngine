import { Button } from '@/components/button/button';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { queries } from '@/utils/api/queries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { produceWithPatches } from 'immer';
import type { UseFieldResult } from '@/utils/form/useField';
import { immerPatchToStandard } from '@/utils/api/immerPatchToStandard';
import { z } from 'zod';
import { useForm } from '@/utils/form/useForm';
import { ButtonRow } from '@/components/button/button-row';
import { updateFormDefault } from '@/utils/form/update-form-default';
import { useTranslation } from 'react-i18next';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { hasDocumentPermission } from '@/utils/security/match-permission';
import { writeDocumentDetailsPrefix } from '@/utils/security/permission-strings';
import type { DocumentSummary } from '@/api/models/DocumentSummary';
import type { MapQueryResult } from '@/utils/api/queries/applyEventToQuery';
import { SelectField } from '@/components/form-fields/select-input/select-field';

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
	name: UseFieldResult<string>;
	folderId: UseFieldResult<string | null>;
	canEdit: boolean;
	allFolders: MapQueryResult<DocumentSummary>['data'];
}) {
	const { t } = useTranslation(['edit-document']);
	return (
		<Fieldset>
			<TextField field={name} />
			<SelectField field={folderId} items={Array.from(allFolders.keys())}>
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
	name: z.string().min(3),
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

	const documentsListResult = useQuery(queries.listDocuments(gameId));
	const documentQueryResult = useQuery(queries.getDocument(gameId, documentId));
	const saveDocument = usePatchDocument(gameId, documentId);

	if (!documentQueryResult.isSuccess || !documentsListResult.isSuccess) {
		if (documentQueryResult.isError || documentsListResult.isError) {
			return 'Failed to load';
		}
		return 'Loading';
	}
	const documentData = documentQueryResult.data;
	updateFormDefault(documentForm, documentData);
	const canEdit = hasDocumentPermission(
		documentData,
		writeDocumentDetailsPrefix,
	);
	documentForm.store.set(documentForm.readOnlyFields, !canEdit);

	return (
		<>
			<form onSubmit={documentForm.handleSubmit(onSubmit)}>
				<DocumentEditFields
					{...documentForm.fields}
					canEdit={canEdit}
					allFolders={documentsListResult.data.data}
				/>
			</form>
		</>
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

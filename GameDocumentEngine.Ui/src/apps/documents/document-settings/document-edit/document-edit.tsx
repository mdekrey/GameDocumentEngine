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

function usePatchDocument(gameId: string, documentId: string) {
	const queryClient = useQueryClient();
	return useMutation(queries.patchDocument(queryClient, gameId, documentId));
}

export function DocumentEditFields({
	name,
	canEdit,
}: {
	name: UseFieldResult<string>;
	canEdit: boolean;
}) {
	const { t } = useTranslation(['edit-document']);
	return (
		<Fieldset>
			<TextField field={name} />
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
		defaultValue: { name: '' },
		translation: t,
		schema: DocumentDetailsSchema,
		fields: {
			name: ['name'],
		},
	});

	const documentQueryResult = useQuery(queries.getDocument(gameId, documentId));
	const saveDocument = usePatchDocument(gameId, documentId);

	if (!documentQueryResult.isSuccess) {
		if (documentQueryResult.isLoadingError) {
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
				<DocumentEditFields {...documentForm.fields} canEdit={canEdit} />
			</form>
		</>
	);

	function onSubmit(currentValue: z.infer<typeof DocumentDetailsSchema>) {
		const patches = produceWithPatches(documentData, (draft) => {
			draft.name = currentValue.name;
		})[1];
		if (patches.length > 0)
			saveDocument.mutate(patches.map(immerPatchToStandard));
	}
}

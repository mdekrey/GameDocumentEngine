import { queries } from '@/utils/api/queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslationForDocument } from '@/utils/api/hooks';
import { type Draft, produceWithPatches } from 'immer';
import type { IGameObjectType } from '@/documents/defineDocument';
import { documentSchema } from '@/documents/defineDocument';
import { type EditableDocumentDetails } from '@/documents/defineDocument';
import { immerPatchToStandard } from '@/utils/api/immerPatchToStandard';
import { useCallback, useEffect } from 'react';
import { useForm, useUpdatingForm } from '@/utils/form';
import { toReadOnlyFields } from '@/documents/toReadOnlyFields';
import { applyPatch, createPatch } from 'rfc6902';
import { fetchLocalDocument } from '../useLocalDocument';
import type { DocumentDetails } from '@vaultvtt/api/openapi/models/DocumentDetails';
import { useEditableDocument } from './useEditableDocument';

export function useDocumentForm<T>(
	document: DocumentDetails,
	docType: IGameObjectType<T>,
) {
	const { schema, fixup } = docType;
	const fullEditable = useEditableDocument<T>(document, fixup);
	const { editable, writablePointers } = fullEditable;
	const queryClient = useQueryClient();
	const updateDocument = useMutation(
		queries.patchDocument(queryClient, document.gameId, document.id),
	);

	const form = useForm({
		defaultValue: editable,
		schema: documentSchema(schema),
		translation: useTranslationForDocument(document, {
			keyPrefix: `document`,
		}),
		readOnly: toReadOnlyFields(writablePointers),
	});
	// TODO: I think this gets replaced with operational transform...?
	useUpdatingForm(form, editable);
	useEffect(() => {
		form.store.set(form.readOnlyFields, toReadOnlyFields(writablePointers));
	}, [form, writablePointers]);

	return {
		editable: fullEditable,
		form,
		onSubmit: useCallback(
			async function onSubmit(currentValue: EditableDocumentDetails<T>) {
				const fixedUp = fixup.fromForm(currentValue);

				const latestDocData = await fetchLocalDocument(
					queryClient,
					document.gameId,
					document.id,
				);

				const patches = produceWithPatches<
					EditableDocumentDetails,
					Draft<EditableDocumentDetails>
				>(latestDocData, (prev) => {
					const ops = createPatch(
						{
							name: prev.name,
							details: prev.details,
						},
						fixedUp,
					);
					applyPatch(prev, ops);
				})[1];

				if (patches.length === 0) return;

				await updateDocument.mutateAsync(patches.map(immerPatchToStandard));
			},
			[document, queryClient, updateDocument, fixup],
		),
	};
}

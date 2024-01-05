import { queries } from '@/utils/api/queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	useTranslationForDocument,
	useTypeOfDocument,
} from '@/utils/api/hooks';
import type { Draft } from 'immer';
import { produceWithPatches } from 'immer';
import type { IGameObjectType } from '@/documents/defineDocument';
import {
	documentSchema,
	type EditableDocumentDetails,
} from '@/documents/defineDocument';
import { immerPatchToStandard } from '@/utils/api/immerPatchToStandard';
import { useCallback, useEffect, useMemo } from 'react';
import { toEditableDetails } from '@/documents/get-document-pointers';
import { useForm } from '@/utils/form';
import { toReadOnlyFields } from '@/documents/toReadOnlyFields';
import { updateFormDefaultMapped } from '@/utils/form';
import { applyPatch, createPatch } from 'rfc6902';
import { useTranslation } from 'react-i18next';
import { fetchLocalDocument, useLocalDocument } from '../useLocalDocument';
import { ErrorBoundary } from '@/components/error-boundary/error-boundary';
import { ErrorScreen } from '@/components/errors/ErrorScreen';
import { missingDocumentType } from '@/documents/defaultMissingWidgetDefinition';

export function DocumentDetails({
	gameId,
	documentId,
}: {
	gameId: string;
	documentId: string;
}) {
	const { t } = useTranslation(['document-details']);

	return (
		<ErrorBoundary
			errorKey={`${gameId}-${documentId}`}
			fallback={<ErrorScreen message={t('unhandled-error')} />}
		>
			<DocumentDetailsForm gameId={gameId} documentId={documentId} />
		</ErrorBoundary>
	);
}

export function DocumentDetailsForm<T = unknown>({
	gameId,
	documentId,
}: {
	gameId: string;
	documentId: string;
}) {
	const document = useLocalDocument(gameId, documentId);
	const docType =
		useTypeOfDocument(document)?.typeInfo ??
		(missingDocumentType as IGameObjectType<T>);
	const { schema, fixup, component: Component } = docType;
	const queryClient = useQueryClient();
	const updateDocument = useMutation(
		queries.patchDocument(queryClient, document.gameId, document.id),
	);
	const editable = useMemo(
		() => toEditableDetails(document, fixup),
		[document, fixup],
	);
	const form = useForm({
		defaultValue: editable.editable,
		schema: documentSchema(schema),
		translation: useTranslationForDocument(document, {
			keyPrefix: `document`,
		}),
		readOnly: toReadOnlyFields(editable.writablePointers),
	});
	updateFormDefaultMapped(form, editable.editable);
	useEffect(() => {
		form.store.set(
			form.readOnlyFields,
			toReadOnlyFields(editable.writablePointers),
		);
	}, [form, editable.writablePointers]);

	const onUpdateDocument = useCallback(
		async function handleUpdate(
			recipe: (draft: Draft<EditableDocumentDetails>) => void,
		) {
			const latestDocData = await fetchLocalDocument(
				queryClient,
				document.gameId,
				document.id,
			);

			const patches = produceWithPatches<
				EditableDocumentDetails,
				Draft<EditableDocumentDetails>
			>(latestDocData, (draft) => void recipe(draft))[1];

			if (patches.length === 0) return;

			await updateDocument.mutateAsync(patches.map(immerPatchToStandard));
		},
		[document, queryClient, updateDocument],
	);

	const onSubmit = useCallback(
		async function onSubmit(currentValue: EditableDocumentDetails<T>) {
			const fixedUp = fixup.fromForm(currentValue);
			await onUpdateDocument((prev) => {
				const ops = createPatch(
					{
						name: prev.name,
						details: prev.details,
					},
					fixedUp,
				);
				applyPatch(prev, ops);
			});
		},
		[onUpdateDocument, fixup],
	);

	if (!editable.readablePointers.pointers.length) return null;

	const component = (
		<Component
			form={form}
			onSubmit={onSubmit}
			document={document}
			readablePointers={editable.readablePointers}
			writablePointers={editable.writablePointers}
		/>
	);

	return docType.noContainer ? (
		component
	) : (
		<div className="p-4 h-full w-full">{component}</div>
	);
}

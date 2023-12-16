import { queries } from '@/utils/api/queries';
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from '@tanstack/react-query';
import { useDocumentType, useGameType } from '@/utils/api/hooks';
import type { Draft } from 'immer';
import { produceWithPatches } from 'immer';
import type { TypedDocumentDetails } from '@/documents/defineDocument';
import {
	documentSchema,
	type EditableDocumentDetails,
} from '@/documents/defineDocument';
import { immerPatchToStandard } from '@/utils/api/immerPatchToStandard';
import { useCallback, useEffect, useMemo } from 'react';
import { toEditableDetails } from '@/documents/get-document-pointers';
import type {
	GameTypeObjectScripts,
	GameTypeScripts,
} from '@/utils/api/queries/game-types';
import { useForm } from '@/utils/form';
import { toReadOnlyFields } from '@/documents/toReadOnlyFields';
import { updateFormDefaultMapped } from '@/utils/form';
import { applyPatch, createPatch } from 'rfc6902';
import { useRealtimeApi } from '@/utils/api/realtime-api';
import type { UserDetails } from '@/api/models/UserDetails';
import { useTranslation } from 'react-i18next';
import { fetchLocalDocument, useLocalDocument } from '../useLocalDocument';
import { ErrorBoundary } from '@/components/error-boundary/error-boundary';
import { ErrorScreen } from '@/components/errors/ErrorScreen';

export function DocumentDetails({
	gameId,
	documentId,
}: {
	gameId: string;
	documentId: string;
}) {
	const { t } = useTranslation(['document-details']);
	const user = useSuspenseQuery(queries.getCurrentUser(useRealtimeApi())).data;
	const document = useLocalDocument(gameId, documentId);
	const gameType = useGameType(gameId);
	const scripts = useDocumentType(gameId, documentId);

	return (
		<ErrorBoundary
			key={`${gameId}-${documentId}`}
			fallback={<ErrorScreen message={t('unhandled-error')} />}
		>
			<DocumentDetailsForm
				gameType={gameType}
				scripts={scripts}
				document={document}
				user={user}
			/>
		</ErrorBoundary>
	);
}

export function DocumentDetailsForm<T = unknown>({
	gameType,
	scripts,
	document,
	user,
}: {
	gameType: GameTypeScripts;
	document: TypedDocumentDetails<T>;
	scripts: GameTypeObjectScripts<T>;
	user: UserDetails;
}) {
	const queryClient = useQueryClient();
	const updateDocument = useMutation(
		queries.patchDocument(queryClient, document.gameId, document.id),
	);
	const { fixup, component: Component } = scripts.typeInfo;
	const editable = useMemo(
		() => toEditableDetails(document, fixup),
		[document, fixup],
	);
	const { t: fullTranslation } = useTranslation(scripts.translationNamespace);
	const { t: formTranslation } = useTranslation(scripts.translationNamespace, {
		keyPrefix: `document`,
	});
	const form = useForm({
		defaultValue: editable.editable,
		schema: documentSchema(scripts.typeInfo.schema),
		translation: formTranslation,
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
			translation={fullTranslation}
			gameType={gameType}
			docType={scripts}
			readablePointers={editable.readablePointers}
			writablePointers={editable.writablePointers}
			user={user}
		/>
	);

	return scripts.typeInfo.noContainer ? (
		component
	) : (
		<div className="p-4 h-full w-full">{component}</div>
	);
}

import { queries } from '@/utils/api/queries';
import type { QueryObserverSuccessResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useGameType } from '../useGameType';
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
import type { GameTypeObjectScripts } from '@/utils/api/queries/game-types';
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
	const user = useQuery(queries.getCurrentUser(useRealtimeApi()));
	const document = useLocalDocument(gameId, documentId);
	const gameType = useGameType(gameId);

	if (user.isLoading || document.isLoading || gameType.isLoading) {
		return <>Loading...</>;
	} else if (user.isError || document.isError || gameType.isError) {
		return <>Error while loading...</>;
	}

	const scripts = gameType.data.objectTypes[document.data.type];

	if (!scripts) {
		return (
			<ErrorScreen
				message={t('unknown-doc-type')}
				explanation={t('unknown-doc-type-explanation')}
			/>
		);
	}

	return (
		<ErrorBoundary
			key={`${gameId}-${documentId}`}
			fallback={<ErrorScreen message={t('unhandled-error')} />}
		>
			<DocumentDetailsForm scripts={scripts} document={document} user={user} />
		</ErrorBoundary>
	);
}

export function DocumentDetailsForm<T = unknown>({
	scripts,
	document,
	user,
}: {
	document: QueryObserverSuccessResult<TypedDocumentDetails<T>>;
	scripts: GameTypeObjectScripts<T>;
	user: QueryObserverSuccessResult<UserDetails>;
}) {
	const queryClient = useQueryClient();
	const updateDocument = useMutation(
		queries.patchDocument(queryClient, document.data.gameId, document.data.id),
	);
	const { fixup, component: Component } = scripts.typeInfo;
	const editable = useMemo(
		() => toEditableDetails(document.data, fixup),
		[document.data, fixup],
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
				document.data.gameId,
				document.data.id,
			);

			const patches = produceWithPatches<
				EditableDocumentDetails,
				Draft<EditableDocumentDetails>
			>(latestDocData, (draft) => void recipe(draft))[1];

			if (patches.length === 0) return;

			await updateDocument.mutateAsync(patches.map(immerPatchToStandard));
		},
		[document.data, queryClient, updateDocument],
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
			document={document.data}
			translation={fullTranslation}
			readablePointers={editable.readablePointers}
			writablePointers={editable.writablePointers}
			user={user.data}
		/>
	);

	return scripts.typeInfo.noContainer ? (
		component
	) : (
		<div className="p-4 h-full w-full">{component}</div>
	);
}

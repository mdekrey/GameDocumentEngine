import type { DocumentDetails } from '@/api/models/DocumentDetails';
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
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { toEditableDetails } from '@/documents/get-document-pointers';
import type { GameTypeObjectScripts } from '@/utils/api/queries/game-types';
import { useForm } from '@/utils/form/useForm';
import { toReadOnlyFields } from '@/documents/toReadOnlyFields';
import { updateFormDefaultMapped } from '@/utils/form/update-form-default';
import { applyPatch, createPatch } from 'rfc6902';
import { useRealtimeApi } from '@/utils/api/realtime-api';
import type { UserDetails } from '@/api/models/UserDetails';

export function DocumentDetails({
	gameId,
	documentId,
}: {
	gameId: string;
	documentId: string;
}) {
	const user = useQuery(queries.getCurrentUser(useRealtimeApi()));
	const document = useQuery(queries.getDocument(gameId, documentId));
	const gameType = useGameType(gameId);

	if (user.isLoading || document.isLoading || gameType.isLoading) {
		return <>Loading...</>;
	} else if (user.isError || document.isError || gameType.isError) {
		return <>Error while loading...</>;
	}

	const scripts = gameType.data.objectTypes[document.data.type];

	return (
		<DocumentDetailsForm scripts={scripts} document={document} user={user} />
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
	const docDetailsUpdatePromiseRef = useRef<Promise<unknown>>(
		Promise.resolve(),
	);
	const queryClient = useQueryClient();
	const updateDocument = useMutation(
		queries.patchDocument(queryClient, document.data.gameId, document.data.id),
	);
	const { fixup, component: Component } = scripts.typeInfo;
	const editable = useMemo(
		() => toEditableDetails(document.data, fixup),
		[document.data, fixup],
	);
	const form = useForm({
		defaultValue: fixup.toForm(editable.editable),
		schema: documentSchema(scripts.typeInfo.schema),
		translation: (f) => scripts.translation(`document.${f}`),
		readOnly: toReadOnlyFields(editable.writablePointers),
	});
	updateFormDefaultMapped(form, editable.document, fixup);
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
			// TODO - while this waits for the previous  update to be completed, I
			// think there's still an issue with setting/unsetting the same value
			// quickly (like pass/fails on the Mouse Guard character).
			await docDetailsUpdatePromiseRef.current;
			const latestDocData =
				queryClient.getQueryData<DocumentDetails>(
					queries.getDocument(document.data.gameId, document.data.id).queryKey,
				) ?? document.data;

			const patches = produceWithPatches<
				EditableDocumentDetails,
				Draft<EditableDocumentDetails>
			>(latestDocData, (draft) => void recipe(draft))[1];

			if (patches.length === 0) return;

			const next = updateDocument.mutateAsync(
				patches.map(immerPatchToStandard),
			);
			docDetailsUpdatePromiseRef.current = next.catch(() => void 0);
			await next;
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

	return (
		<div className="p-4">
			{editable.readablePointers.pointers.length > 0 && (
				<Component
					form={form}
					onSubmit={onSubmit}
					translation={scripts.translation}
					readablePointers={editable.readablePointers}
					writablePointers={editable.writablePointers}
					objectRole={document.data.userRoles[user.data.id]}
				/>
			)}
		</div>
	);
}

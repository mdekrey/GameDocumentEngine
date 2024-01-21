import { type FormFieldReturnType, useFormAtom } from '@/utils/form';
import type { Atom } from 'jotai';
import { useCreateDocumentDetails } from './useCreateDocumentDetails';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/error-boundary/error-boundary';
import { useCallback } from 'react';
import type { GameTypeObjectScripts } from '@/utils/api/queries/game-types';
import { useDocTypeTranslation } from '@/utils/api/hooks';
import type { StandardWritableAtom } from '@principlestudios/react-jotai-forms/internals/StandardWritableAtom';

export function CreateDocumentDetails({
	documentTypeAtom,
	gameId,
	detailsField,
}: {
	documentTypeAtom: Atom<string>;
	gameId: string;
	detailsField: FormFieldReturnType<{
		[k: string]: unknown;
	}>;
}) {
	const { disabled, docType } = useCreateDocumentDetails(
		documentTypeAtom,
		gameId,
	);

	const CreateDetails = useCallback(
		function CreateDetails<T>({
			docType,
		}: {
			docType: GameTypeObjectScripts<T>;
		}) {
			if (!docType) throw new Error('Doc type is required');

			const field = useFormAtom(
				Object.assign(detailsField.atom as unknown as StandardWritableAtom<T>, {
					init: docType.typeInfo.template,
				}),
				{
					// disabled,
					schema: docType.typeInfo.schema,
					translation: useDocTypeTranslation(docType.key, {
						keyPrefix: 'document',
					}),
					fields: {
						field: {
							path: [],
							translationPath: ['details'],
							disabled,
						},
					},
				},
			).fields.field as FormFieldReturnType<T>;

			const Component = docType.typeInfo.creationComponent;
			if (!Component) return <></>;

			return <Component gameId={gameId} templateField={field} />;
		},
		[gameId, detailsField.atom, disabled],
	);

	if (!docType) return <></>;

	const Component = docType.typeInfo.creationComponent;

	if (!Component) return <></>;

	return (
		<Suspense>
			<ErrorBoundary
				errorKey={docType.key}
				fallback={detailsField.translation('unhandled-error')}
			>
				<CreateDetails key={docType.key} docType={docType} />
			</ErrorBoundary>
		</Suspense>
	);
}

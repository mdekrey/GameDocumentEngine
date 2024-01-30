import { Fragment, useCallback } from 'react';
import type { Atom } from 'jotai';
import { type FormFieldReturnType, useFormAtom } from '@/utils/form';
import { useDocTypeTranslation } from '@/utils/api/hooks';
import { ErrorBoundary } from '@/components/error-boundary/error-boundary';
import { LoadingSection } from '@/components/layout/LoadingSection';
import { useCreateDocumentDetails } from './useCreateDocumentDetails';

function useCreateDetails<T>(
	gameId: string,
	detailsField: FormFieldReturnType<T>,
	documentTypeAtom: Atom<string>,
) {
	const { disabled, docType } = useCreateDocumentDetails<T>(
		documentTypeAtom,
		gameId,
	);
	const fullResult = useCallback(
		function CreateDetails() {
			if (!docType) throw new Error('Doc type is required');

			const field = useFormAtom(
				Object.assign(detailsField.atom, {
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

			return (
				<ErrorBoundary fallback={detailsField.translation('unhandled-error')}>
					<Component gameId={gameId} templateField={field} />
				</ErrorBoundary>
			);
		},
		[gameId, detailsField, disabled, docType],
	);
	return docType ? fullResult : Fragment;
}

export function CreateDocumentDetails<T>({
	documentTypeAtom,
	gameId,
	detailsField,
}: {
	documentTypeAtom: Atom<string>;
	gameId: string;
	detailsField: FormFieldReturnType<T>;
}) {
	const CreateDetails = useCreateDetails<T>(
		gameId,
		detailsField,
		documentTypeAtom,
	);

	return (
		<LoadingSection>
			<CreateDetails />
		</LoadingSection>
	);
}

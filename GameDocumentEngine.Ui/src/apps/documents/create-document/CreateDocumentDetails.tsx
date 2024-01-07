import type { FormFieldReturnType } from '@/utils/form';
import type { Atom } from 'jotai';
import { useCreateDocumentDetails } from './useCreateDocumentDetails';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/error-boundary/error-boundary';

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
	const { docType } = useCreateDocumentDetails(documentTypeAtom, gameId);

	if (!docType) return <></>;

	const Component = docType.typeInfo.creationComponent;

	if (!Component) return <></>;

	return (
		<Suspense>
			<ErrorBoundary
				errorKey={docType.key}
				fallback={detailsField.translation('unhandled-error')}
			>
				<Component
					templateField={detailsField as FormFieldReturnType<unknown>}
				/>
			</ErrorBoundary>
		</Suspense>
	);
}

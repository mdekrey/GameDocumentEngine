import { useTypeOfDocument } from '@/utils/api/hooks';
import type { IGameObjectType } from '@/documents/defineDocument';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalDocument } from '../useLocalDocument';
import { ErrorBoundary } from '@/components/error-boundary/error-boundary';
import { ErrorScreen } from '@/components/errors/ErrorScreen';
import { missingDocumentType } from '@/documents/defaultMissingWidgetDefinition';
import { DocumentDetailsContainer } from './DocumentDetailsContainer';
import { useDocumentForm } from './useDocumentForm';

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
		useTypeOfDocument<T>(document)?.typeInfo ??
		(missingDocumentType as IGameObjectType<T>);
	const { editable, form, onSubmit } = useDocumentForm(document, docType);

	if (!editable.readablePointers.pointers.length) return null;

	const Container = docType.noContainer ? Fragment : DocumentDetailsContainer;
	return (
		<Container>
			<docType.component
				form={form}
				onSubmit={onSubmit}
				document={document}
				readablePointers={editable.readablePointers}
				writablePointers={editable.writablePointers}
			/>
		</Container>
	);
}

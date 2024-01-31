import { HiOutlineCog6Tooth } from 'react-icons/hi2';
import { IconLinkButton } from '@/components/button/icon-link-button';
import { useTranslation } from 'react-i18next';
import { displayDocumentSettings } from '../document-settings/document-settings';
import { useDocument } from '@/utils/api/hooks';
import { Subheader } from '@/components/subheader/subheader';
import type { TFunction } from 'i18next';
import type { DocumentDetails } from '@/api/models/DocumentDetails';

export function DocumentSubheader({
	gameId,
	documentId,
}: {
	gameId: string;
	documentId: string;
}) {
	const { t } = useTranslation(['document-details']);
	const document = useDocument(gameId, documentId);

	return <DocumentSubheaderPresentation t={t} document={document} />;
}
export function DocumentSubheaderPresentation({
	t,
	document,
}: {
	t: TFunction;
	document: DocumentDetails;
}) {
	return (
		<Subheader
			title={document.name}
			to={`/game/${document.gameId}/document/${document.id}`}
		>
			{displayDocumentSettings(document) && (
				<IconLinkButton.Secondary
					to={`/game/${document.gameId}/document/${document.id}/settings`}
					title={t('settings', { name: document.name })}
				>
					<HiOutlineCog6Tooth />
				</IconLinkButton.Secondary>
			)}
		</Subheader>
	);
}

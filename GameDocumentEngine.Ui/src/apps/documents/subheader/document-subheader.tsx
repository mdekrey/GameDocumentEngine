import { HiOutlineCog6Tooth } from 'react-icons/hi2';
import { IconLinkButton } from '@/components/button/icon-link-button';
import { useTranslation } from 'react-i18next';
import { displayDocumentSettings } from '../document-settings/document-settings';
import { useDocument } from '@/utils/api/hooks';
import { Subheader } from '@/components/subheader/subheader';

export function DocumentSubheader({
	gameId,
	documentId,
}: {
	gameId: string;
	documentId: string;
}) {
	const { t } = useTranslation(['document-details']);
	const document = useDocument(gameId, documentId);

	return (
		<Subheader
			title={document.name}
			to={`/game/${gameId}/document/${documentId}`}
		>
			{displayDocumentSettings(document) && (
				<IconLinkButton.Secondary
					to={`/game/${gameId}/document/${documentId}/settings`}
					title={t('settings', { name: document.name })}
				>
					<HiOutlineCog6Tooth />
				</IconLinkButton.Secondary>
			)}
		</Subheader>
	);
}

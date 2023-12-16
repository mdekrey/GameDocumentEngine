import { HiOutlineCog6Tooth } from 'react-icons/hi2';
import { IconLinkButton } from '@/components/button/icon-link-button';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { displayDocumentSettings } from '../document-settings/document-settings';
import { useDocument } from '@/utils/api/hooks';

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
		<div className="flex flex-row gap-3 items-end">
			<h1 className="text-2xl font-bold flex-1 overflow-hidden">
				<Link to={`/game/${gameId}/document/${documentId}`}>
					{document.name}
				</Link>
			</h1>
			{displayDocumentSettings(document) && (
				<IconLinkButton.Secondary
					to={`/game/${gameId}/document/${documentId}/settings`}
					title={t('settings', { name: document.name })}
				>
					<HiOutlineCog6Tooth />
				</IconLinkButton.Secondary>
			)}
		</div>
	);
}

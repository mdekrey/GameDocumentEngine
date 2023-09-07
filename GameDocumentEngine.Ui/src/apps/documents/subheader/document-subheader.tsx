import { queries } from '@/utils/api/queries';
import { useQuery } from '@tanstack/react-query';
import { HiOutlineCog6Tooth } from 'react-icons/hi2';
import { IconLinkButton } from '@/components/button/icon-link-button';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function DocumentSubheader({
	gameId,
	documentId,
}: {
	gameId: string;
	documentId: string;
}) {
	const { t } = useTranslation(['document-details']);
	const documentResult = useQuery(queries.getDocument(gameId, documentId));

	if (documentResult.isLoading) {
		return 'Loading';
	}
	if (documentResult.isError) {
		return 'An error occurred loading the document.';
	}

	const document = documentResult.data;

	return (
		<div className="flex flex-row gap-3 items-end">
			<h1 className="text-2xl font-bold flex-1 overflow-hidden">
				<Link to={`/game/${gameId}/document/${documentId}`}>
					{document.name}
				</Link>
			</h1>
			<IconLinkButton.Secondary
				to={`/game/${gameId}/document/${documentId}/settings`}
				title={t('settings', { name: document.name })}
			>
				{/* TODO - do we have permissions for this link? */}
				<HiOutlineCog6Tooth />
			</IconLinkButton.Secondary>
		</div>
	);
}

import { queries } from '@/utils/api/queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { HiOutlineCog6Tooth } from 'react-icons/hi2';
import { IconLinkButton } from '@/components/button/icon-link-button';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { displayGameSettings } from '../game-settings/game-settings';

export function GameSubheader({ gameId }: { gameId: string }) {
	const { t } = useTranslation(['game-details']);
	const gameDetails = useSuspenseQuery(queries.getGameDetails(gameId)).data;

	return (
		<div className="flex flex-row gap-3">
			<h1 className="text-2xl font-bold flex-1">
				<Link to={`/game/${gameId}`}>{gameDetails.name}</Link>
			</h1>
			{displayGameSettings(gameDetails) && (
				<IconLinkButton.Secondary
					to={`/game/${gameId}/settings`}
					title={t('edit-game')}
				>
					<HiOutlineCog6Tooth />
				</IconLinkButton.Secondary>
			)}
		</div>
	);
}

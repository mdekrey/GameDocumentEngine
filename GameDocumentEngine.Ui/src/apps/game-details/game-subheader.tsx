import { HiOutlineCog6Tooth } from 'react-icons/hi2';
import { IconLinkButton } from '@/components/button/icon-link-button';
import { useTranslation } from 'react-i18next';
import { displayGameSettings } from '../game-settings/game-settings';
import { useGame } from '@/utils/api/hooks';
import { Subheader } from '@/components/subheader/subheader';

export function GameSubheader({ gameId }: { gameId: string }) {
	const { t } = useTranslation(['game-details']);
	const gameDetails = useGame(gameId);

	return (
		<Subheader to={`/game/${gameId}`} title={gameDetails.name}>
			{displayGameSettings(gameDetails) && (
				<IconLinkButton.Secondary
					to={`/game/${gameId}/settings`}
					title={t('edit-game')}
				>
					<HiOutlineCog6Tooth />
				</IconLinkButton.Secondary>
			)}
		</Subheader>
	);
}

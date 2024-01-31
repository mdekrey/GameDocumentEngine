import { HiOutlineCog6Tooth } from 'react-icons/hi2';
import { IconLinkButton } from '@/components/button/icon-link-button';
import { useTranslation } from 'react-i18next';
import { displayGameSettings } from '../game-settings/game-settings';
import { useGame } from '@/utils/api/hooks';
import { Subheader } from '@/components/subheader/subheader';
import type { TFunction } from 'i18next';
import type { GameDetails } from '@/api/models/GameDetails';

export function GameSubheader({ gameId }: { gameId: string }) {
	const { t } = useTranslation(['game-details']);
	const gameDetails = useGame(gameId);

	return <GameSubheaderPresentation t={t} game={gameDetails} />;
}

export function GameSubheaderPresentation({
	t,
	game,
}: {
	t: TFunction;
	game: GameDetails;
}) {
	return (
		<Subheader to={`/game/${game.id}`} title={game.name}>
			{displayGameSettings(game) && (
				<IconLinkButton.Secondary
					to={`/game/${game.id}/settings`}
					title={t('edit-game')}
				>
					<HiOutlineCog6Tooth />
				</IconLinkButton.Secondary>
			)}
		</Subheader>
	);
}

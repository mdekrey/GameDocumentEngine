import { useTranslation } from 'react-i18next';
import { queries } from '@/utils/api/queries';
import { useQuery } from '@tanstack/react-query';
import { IntroText } from '@/components/text/common';
import { ReactComponent as Arrow } from './arrow.svg';

export function GameDetails({ gameId }: { gameId: string }) {
	const gameResult = useQuery(queries.getGameDetails(gameId));
	const { t } = useTranslation(['game-details']);

	if (gameResult.isLoading) {
		return 'Loading';
	}
	if (!gameResult.isSuccess) {
		return 'An error occurred loading the game.';
	}

	return (
		<div className="min-h-[10rem] lg:h-max flex flex-row items-center p-4 gap-8 max-w-screen-md">
			<Arrow className="w-40 h-40 rotate-[-30deg] lg:rotate-[-70deg] flex-shrink-0" />
			<IntroText className="lg:hidden">{t('mobile-instructions')}</IntroText>
			<IntroText className="hidden lg:block">
				{t('sidebar-instructions')}
			</IntroText>
		</div>
	);
}

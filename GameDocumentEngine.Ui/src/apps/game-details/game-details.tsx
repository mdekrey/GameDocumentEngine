import { useTranslation } from 'react-i18next';
import { IntroText } from '@/components/text/common';
import { ReactComponent as Arrow } from './arrow.svg';
import { useGame } from '@/utils/api/hooks';
import type { TFunction } from 'i18next';

export function GameDetails({ gameId }: { gameId: string }) {
	// TODO: display things here
	useGame(gameId);
	const { t } = useTranslation(['game-details']);

	return <GameDetailsInitialInstructionsPresentation t={t} />;
}

export function GameDetailsInitialInstructionsPresentation({
	t,
}: {
	t: TFunction;
}) {
	return (
		<div className="min-h-[10rem] lg:h-max flex flex-row items-center p-4 gap-8 max-w-screen-md">
			<Arrow className="w-24 h-24 sm:w-40 sm:h-40 -rotate-12 sm:rotate-[-30deg] lg:rotate-[-70deg] flex-shrink-0" />
			<IntroText className="lg:hidden">{t('mobile-instructions')}</IntroText>
			<IntroText className="hidden lg:block">
				{t('sidebar-instructions')}
			</IntroText>
		</div>
	);
}

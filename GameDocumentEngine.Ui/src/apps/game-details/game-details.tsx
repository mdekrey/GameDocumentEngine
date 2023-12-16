import { useTranslation } from 'react-i18next';
import { queries } from '@/utils/api/queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { IntroText } from '@/components/text/common';
import { ReactComponent as Arrow } from './arrow.svg';

export function GameDetails({ gameId }: { gameId: string }) {
	// TODO: display things here
	useSuspenseQuery(queries.getGameDetails(gameId));
	const { t } = useTranslation(['game-details']);

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

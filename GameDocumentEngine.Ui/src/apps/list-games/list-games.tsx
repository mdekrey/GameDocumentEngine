import { IconLinkButton } from '@/components/button/icon-link-button';
import { SingleColumnSections } from '@/components/sections';
import { queries } from '@/utils/api/queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { HiArrowRight, HiPlus } from 'react-icons/hi2';
import { Link } from 'react-router-dom';

export function ListGames() {
	const { t } = useTranslation(['list-games']);
	const games = useSuspenseQuery(queries.listGames).data;

	return (
		<SingleColumnSections>
			<span className="flex flex-row items-center gap-4 my-4">
				<h1 className="text-2xl font-bold flex-1">{t('title')}</h1>
				<IconLinkButton.Save title={t('new-game')} to={'/create-game'}>
					<HiPlus />
				</IconLinkButton.Save>
			</span>
			{Object.values(games).length ? (
				<ul className="contents">
					{Object.values(games).map((game) => (
						<li key={game.id} className="flex flex-row items-center gap-4">
							<Link to={`/game/${game.id}`}>{game.name}</Link>
							<hr className="flex-1" />
							<div className="my-2 flex flex-row gap-2">
								<IconLinkButton
									title={t('go-to-game', { name: game.name })}
									to={`/game/${game.id}`}
								>
									<HiArrowRight />
								</IconLinkButton>
							</div>
						</li>
					))}
				</ul>
			) : (
				<p className="text-center font-bold">{t('none')}</p>
			)}
		</SingleColumnSections>
	);
}

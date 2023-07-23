import { IconLinkButton } from '@/components/button/icon-link-button';
import { queries } from '@/utils/api/queries';
import { NarrowContent } from '@/utils/containers/narrow-content';
import { useQuery } from '@tanstack/react-query';
import { HiArrowRight, HiPlus } from 'react-icons/hi2';
import { Link } from 'react-router-dom';

export function ListGames() {
	const gamesResult = useQuery(queries.listGames);

	if (gamesResult.isLoading) {
		return 'Loading';
	}
	if (!gamesResult.isSuccess) {
		return 'An error occurred loading the list of games.';
	}

	return (
		<NarrowContent>
			<span className="flex flex-row items-center gap-4 mb-4">
				<h1 className="text-2xl font-bold flex-1">All Games</h1>
				<IconLinkButton.Save to={'/create-game'}>
					<HiPlus />
				</IconLinkButton.Save>
			</span>
			<ul className="contents">
				{Object.values(gamesResult.data).map((game) => (
					<li key={game.id} className="flex flex-row items-center gap-4">
						<Link to={`/game/${game.id}`}>{game.name}</Link>
						<hr className="flex-1" />
						<div className="my-2 flex flex-row gap-2">
							<IconLinkButton to={`/game/${game.id}`}>
								<HiArrowRight />
							</IconLinkButton>
						</div>
					</li>
				))}
			</ul>
		</NarrowContent>
	);
}

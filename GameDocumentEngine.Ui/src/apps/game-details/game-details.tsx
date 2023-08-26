import { queries } from '@/utils/api/queries';
import { useQuery } from '@tanstack/react-query';

export function GameDetails({ gameId }: { gameId: string }) {
	const gameResult = useQuery(queries.getGameDetails(gameId));

	if (gameResult.isLoading) {
		return 'Loading';
	}
	if (!gameResult.isSuccess) {
		return 'An error occurred loading the game.';
	}

	return <></>;
}

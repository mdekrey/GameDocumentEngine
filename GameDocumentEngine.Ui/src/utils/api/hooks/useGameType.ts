import { queries } from '../queries';
import type { GameTypeScripts } from '../queries/game-types';
import { getGameTypeScripts } from '../queries/game-types';
import type { QueryClient } from '@tanstack/react-query';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';

export async function getGameType(
	queryClient: QueryClient,
	gameId: string,
): Promise<GameTypeScripts> {
	const game = await queryClient.fetchQuery(queries.getGameDetails(gameId));
	return await queryClient.fetchQuery(
		getGameTypeScripts(game.typeInfo.key ?? 'none', queryClient),
	);
}

export function useGameType(gameId: string): GameTypeScripts {
	const queryClient = useQueryClient();
	const game = useSuspenseQuery(queries.getGameDetails(gameId)).data;
	return useSuspenseQuery(
		getGameTypeScripts(game.typeInfo.key ?? 'none', queryClient),
	).data;
}

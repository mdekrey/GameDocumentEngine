import { queries } from '@/utils/api/queries';
import type { GameTypeScripts } from '@/utils/api/queries/game-types';
import { getGameTypeScripts } from '@/utils/api/queries/game-types';
import type { QueryClient, UseQueryResult } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export async function getGameType(
	queryClient: QueryClient,
	gameId: string,
): Promise<GameTypeScripts> {
	const game = await queryClient.fetchQuery(queries.getGameDetails(gameId));
	return await queryClient.fetchQuery(
		getGameTypeScripts(game.typeInfo.key ?? 'none', queryClient),
	);
}

export function useGameType(
	gameId: string,
): UseQueryResult<GameTypeScripts, unknown> {
	const queryClient = useQueryClient();
	const game = useQuery(queries.getGameDetails(gameId));
	return useQuery({
		...getGameTypeScripts(game.data?.typeInfo.key ?? 'none', queryClient),
		enabled: game.isSuccess,
	});
}

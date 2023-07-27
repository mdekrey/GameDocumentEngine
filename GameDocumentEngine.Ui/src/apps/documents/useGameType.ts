import { queries } from '@/utils/api/queries';
import {
	GameTypeScripts,
	getGameTypeScripts,
} from '@/utils/api/queries/game-types';
import {
	UseQueryResult,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';

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

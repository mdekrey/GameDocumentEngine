import { useRealtimeApi } from '@/utils/api/realtime-api';
import { useSuspenseQuery } from '@tanstack/react-query';
import { queries } from '../queries';

export function useGame(gameId: string) {
	return useSuspenseQuery(queries.getGameDetails(gameId)).data;
}

export function useDocument(gameId: string, documentId: string) {
	return useSuspenseQuery(queries.getDocument(gameId, documentId)).data;
}

export function useCurrentUser() {
	const realtimeApi = useRealtimeApi();
	return useSuspenseQuery(queries.getCurrentUser(realtimeApi)).data;
}

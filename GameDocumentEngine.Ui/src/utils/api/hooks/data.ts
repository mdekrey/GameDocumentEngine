import { useRealtimeApi } from '@/utils/api/realtime-api';
import { useSuspenseQuery } from '@tanstack/react-query';
import { queries } from '../queries';

export function useAllGameTypes() {
	return useSuspenseQuery(queries.listGameTypes()).data;
}
export function useAllGames() {
	return useSuspenseQuery(queries.listGames).data;
}

export function useGame(gameId: string) {
	return useSuspenseQuery(queries.getGameDetails(gameId)).data;
}

export function useAllDocuments(gameId: string) {
	return useSuspenseQuery(queries.listDocuments(gameId)).data;
}
export function useInvitations(gameId: string) {
	return Object.values(useSuspenseQuery(queries.listInvitations(gameId)).data);
}

export function useDocument(gameId: string, documentId: string) {
	return useSuspenseQuery(queries.getDocument(gameId, documentId)).data;
}

export function useCurrentUser() {
	const realtimeApi = useRealtimeApi();
	return useSuspenseQuery(queries.getCurrentUser(realtimeApi)).data;
}

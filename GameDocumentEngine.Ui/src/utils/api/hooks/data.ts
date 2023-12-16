import { useSuspenseQuery } from '@tanstack/react-query';
import { queries } from '../queries';

export function useDocument(gameId: string, documentId: string) {
	return useSuspenseQuery(queries.getDocument(gameId, documentId)).data;
}

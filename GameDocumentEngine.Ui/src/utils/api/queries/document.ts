import { api } from '../fetch-api';

export const getDocument = (gameId: string, documentId: string) => {
	const result = {
		queryKey: ['game', gameId, 'document', documentId] as const,
		queryFn: () => api.getDocument({ params: { gameId, id: documentId } }),
	};
	return result;
};

import { QueryClient, UseMutationOptions } from '@tanstack/react-query';
import { api } from '../fetch-api';
import { NavigateFunction } from 'react-router-dom';
import { GameDetails } from '@/api/models/GameDetails';
import { CreateGameDetails } from '@/api/models/CreateGameDetails';
import { Patch } from 'rfc6902';

export const listGameTypes = () => ({
	queryKey: ['gameTypes'],
	queryFn: async () => {
		const response = await api.listGameTypes();
		if (response.statusCode !== 200) {
			return Promise.reject(response);
		}
		return response.data;
	},
});

export const listGames = {
	queryKey: ['game'],
	queryFn: async () => {
		const response = await api.listGames();
		if (response.statusCode !== 200) return Promise.reject(response);
		return response.data;
	},
};

export function createGame(
	queryClient: QueryClient,
	navigate: NavigateFunction,
): UseMutationOptions<GameDetails, unknown, CreateGameDetails, unknown> {
	return {
		mutationFn: async (game: CreateGameDetails) => {
			const response = await api.createGame({ body: game });
			if (response.statusCode === 200) return response.data;
			else throw new Error('Could not save changes');
		},
		onSuccess: async (game) => {
			await queryClient.invalidateQueries(listGames.queryKey);
			navigate(`/game/${game.id}`);
		},
	};
}

export const getGameDetails = (gameId: string) => ({
	queryKey: ['game', gameId],
	queryFn: async () => {
		const response = await api.getGameDetails({ params: { gameId } });
		if (response.statusCode !== 200) return Promise.reject(response);
		// TODO: use details here of game type and store in game-types cache
		return response.data;
	},
});

export function patchGame(
	queryClient: QueryClient,
	gameId: string,
): UseMutationOptions<GameDetails, unknown, Patch, unknown> {
	return {
		mutationFn: async (changes: Patch) => {
			const response = await api.patchGame({
				params: { gameId },
				body: changes,
			});
			if (response.statusCode === 200) return response.data;
			else if (response.statusCode === 409)
				throw new Error(
					'Other changes were being applied at the same time. Try again later.',
				);
			else throw new Error('Could not save changes');
		},
		onSuccess: (response) => {
			queryClient.setQueryData(getGameDetails(gameId).queryKey, response);
		},
		onError: async () => {
			await queryClient.invalidateQueries(getGameDetails(gameId).queryKey);
		},
	};
}

export function deleteGame(
	queryClient: QueryClient,
): UseMutationOptions<undefined, unknown, string, unknown> {
	return {
		mutationFn: async (id: string) => {
			const response = await api.deleteGame({ params: { gameId: id } });
			if (response.statusCode === 200) return response.data;
			else throw new Error('Could not save changes');
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries(listGames.queryKey);
		},
	};
}

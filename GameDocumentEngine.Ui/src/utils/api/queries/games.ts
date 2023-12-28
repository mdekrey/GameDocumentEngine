import type { QueryClient, UseMutationOptions } from '@tanstack/react-query';
import { api } from '../fetch-api';
import type { NavigateFunction } from 'react-router-dom';
import type { GameDetails } from '@/api/models/GameDetails';
import type { CreateGameDetails } from '@/api/models/CreateGameDetails';
import type { Patch } from 'rfc6902';
import type { EntityChangedProps } from '../EntityChangedProps';
import {
	applyChangeToQuery,
	applyEventToQuery,
	applyPatchToQuery,
} from './applyEventToQuery';
import { i18n } from '@/utils/i18n/setup';
import { getGameTypeTranslationNamespace } from '../accessors';
import {
	constructUrl as importGameUrl,
	method as importGameMethod,
	constructResponse as constructImportGameResponse,
} from '@/api/operations/importGame';
import { constructUrl as getGameExportUrl } from '@/api/operations/getGameExport';

export const listGameTypes = () => ({
	queryKey: ['gameTypes'],
	queryFn: async () => {
		const response = await api.listGameTypes();
		if (response.statusCode !== 200) {
			return Promise.reject(response);
		}
		await Promise.all(
			Object.values(response.data).map(async (gt) =>
				i18n.loadNamespaces(getGameTypeTranslationNamespace(gt.key)),
			),
		);
		return response.data;
	},
});

export const listGames = {
	queryKey: ['game', 'list'],
	queryFn: async () => {
		const response = await api.listGames();
		if (response.statusCode !== 200) return Promise.reject(response);
		return response.data;
	},
};

export async function invalidateGameList(queryClient: QueryClient) {
	await queryClient.invalidateQueries({ queryKey: listGames.queryKey });
}

export function createGame(
	navigate: NavigateFunction,
): UseMutationOptions<GameDetails, unknown, CreateGameDetails, unknown> {
	return {
		mutationFn: async (game: CreateGameDetails) => {
			const response = await api.createGame({ body: game });
			if (response.statusCode === 200) return response.data;
			else throw new Error('Could not save changes');
		},
		onSuccess: (game) => {
			navigate(`/game/${game.id}`);
		},
	};
}

export const getGameDetails = (gameId: string) => ({
	queryKey: ['game', gameId],
	queryFn: async () => {
		const response = await api.getGameDetails({ params: { gameId } });
		if (response.statusCode !== 200) return Promise.reject(response);
		return response.data;
	},
});

export async function handleGameUpdateEvent(
	queryClient: QueryClient,
	event: EntityChangedProps<string, GameDetails>,
) {
	const query = getGameDetails(event.key);
	const resultData = await applyEventToQuery(queryClient, query, event);

	if ('removed' in event && event.removed) {
		await applyPatchToQuery(queryClient, listGames, [
			{ path: `/${event.key}`, op: 'remove' },
		]);
	} else if (resultData) {
		await applyChangeToQuery(queryClient, listGames, (list) => {
			list[event.key] = {
				id: resultData.id,
				name: resultData.name,
			};
		});
	} else {
		await queryClient.invalidateQueries({ queryKey: listGames.queryKey });
	}
}

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
		onError: async () => {
			await queryClient.invalidateQueries({
				queryKey: getGameDetails(gameId).queryKey,
			});
		},
	};
}

export const deleteGame: UseMutationOptions<
	undefined,
	unknown,
	string,
	unknown
> = {
	mutationFn: async (id: string) => {
		const response = await api.deleteGame({ params: { gameId: id } });
		if (response.statusCode === 200) return response.data;
		else throw new Error('Could not save changes');
	},
};

export const removeUserFromGame: UseMutationOptions<
	undefined,
	unknown,
	{ gameId: string; userId: string },
	unknown
> = {
	mutationFn: async ({ gameId, userId }) => {
		const response = await api.removeUserFromGame({
			params: { gameId, userId },
		});
		if (response.statusCode === 204) return;
		else throw new Error('Could not save changes');
	},
};

export const getGameExport = getGameExportUrl;

export function importGame(
	navigate: NavigateFunction,
): UseMutationOptions<{ gameId: string }, unknown, { file: File }, unknown> {
	return {
		mutationFn: async ({ file }) => {
			const response = await fetch(importGameUrl({}), {
				method: importGameMethod,
				headers: {
					'content-type': 'application/x-zip',
				},
				body: file,
			});
			const result = constructImportGameResponse({
				status: response.status,
				response: await response.json(),
				getResponseHeader(header: string) {
					return response.headers.get(header);
				},
			});

			if (result.statusCode === 200) return result.data;
			throw new Error('Could not import game');
		},
		onSuccess: ({ gameId }) => {
			navigate(`/game/${gameId}`);
		},
	};
}

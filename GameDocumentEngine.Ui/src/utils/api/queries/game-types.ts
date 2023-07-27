import { GameTypeDetails } from '@/api/models/GameTypeDetails';
import { QueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api } from '../fetch-api';
import { IGameObjectType } from '@/documents/defineDocument';
import { GameObjectTypeDetails } from '@/api/models/GameObjectTypeDetails';
import { TFunction } from 'i18next';
import { i18n } from '@/utils/i18n/setup';

export function getGameType(
	gameType: string,
): UseQueryOptions<GameTypeDetails> {
	return {
		queryKey: ['gameType', gameType],
		queryFn: async () => {
			const response = await api.getGameType({ params: { gameType } });
			if (response.statusCode !== 200) return Promise.reject(response);
			return response.data;
		},
	};
}

export type GameTypeScripts = {
	objectTypes: Record<string, GameTypeObjectScripts>;
	translation: TFunction<`game-types:${string}`, undefined>;
};

export type GameTypeObjectScripts = {
	typeInfo: IGameObjectType;
	translation: TFunction<`doc-types:${string}`, undefined>;
};

export function getGameTypeScripts(
	gameTypeKey: string,
	queryClient: QueryClient,
): UseQueryOptions<GameTypeScripts> {
	return {
		queryKey: ['gameType', gameTypeKey, 'scripts'],
		queryFn: async () => {
			const typeInfo = await queryClient.fetchQuery(getGameType(gameTypeKey));

			return {
				...typeInfo,
				objectTypes: Object.fromEntries(
					await Promise.all(
						typeInfo.objectTypes.map(
							async (objectType) =>
								[
									objectType.key,
									await queryClient.fetchQuery(getObjectType(objectType)),
								] as const,
						),
					),
				),
				translation: i18n.getFixedT(null, `game-types:${gameTypeKey}`),
			} as GameTypeScripts;
		},
	};
}

function getObjectType(objectType: GameObjectTypeDetails) {
	return {
		queryKey: ['gameObjectType', objectType.key],
		queryFn: async (): Promise<GameTypeObjectScripts> => {
			await Promise.all(
				objectType.scripts.map(
					(src) =>
						new Promise((resolve, reject) => {
							try {
								const tag = document.createElement('script');
								const container = document.head || document.body;

								tag.type = 'module';
								tag.crossOrigin = 'true';
								tag.src = src;

								tag.addEventListener('load', () => {
									resolve({ loaded: true, error: false });
								});

								tag.addEventListener('error', () => {
									reject({
										loaded: false,
										error: true,
										message: `Failed to load script with src ${src}`,
									});
								});

								container.appendChild(tag);
							} catch (error) {
								reject(error);
							}
						}),
				),
			);

			return {
				translation: i18n.getFixedT(null, `doc-types:${objectType.key}`),
				typeInfo: window.widgets[objectType.key],
			};
		},
	};
}

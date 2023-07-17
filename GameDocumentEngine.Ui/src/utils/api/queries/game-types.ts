import { GameTypeDetails } from '@/api/models/GameTypeDetails';
import { QueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api } from '../fetch-api';
import { IGameObjectType } from '@/documents/defineDocument';
import { GameObjectTypeDetails } from '@/api/models/GameObjectTypeDetails';

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
};

export type GameTypeObjectScripts = {
	typeInfo: IGameObjectType;
};

export function getGameTypeScripts(
	gameTypeName: string,
	queryClient: QueryClient,
): UseQueryOptions<GameTypeScripts> {
	return {
		queryKey: ['gameType', gameTypeName, 'scripts'],
		queryFn: async () => {
			const typeInfo = await queryClient.fetchQuery(getGameType(gameTypeName));

			return {
				...typeInfo,
				objectTypes: Object.fromEntries(
					await Promise.all(
						typeInfo.objectTypes.map(
							async (objectType) =>
								[
									objectType.name,
									await queryClient.fetchQuery(getObjectType(objectType)),
								] as const,
						),
					),
				),
			} as GameTypeScripts;
		},
	};
}

function getObjectType(objectType: GameObjectTypeDetails) {
	return {
		queryKey: ['gameObjectType', objectType.name],
		queryFn: async () => {
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
				typeInfo: window.widgets[objectType.name],
			};
		},
	};
}
import type { GameTypeDetails } from '@/api/models/GameTypeDetails';
import type { QueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api } from '../fetch-api';
import type { IGameObjectType } from '@/documents/defineDocument';
import type { GameObjectTypeDetails } from '@/api/models/GameObjectTypeDetails';

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
	translationNamespace: `game-types:${string}`;
};

export type GameTypeObjectScripts<T = unknown> = {
	typeInfo: IGameObjectType<T>;
	translationNamespace: `doc-types:${string}`;
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
				translationNamespace: `game-types:${gameTypeKey}`,
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
								const tag =
									src.endsWith('.js') ||
									src.endsWith('.ts') ||
									src.endsWith('.tsx')
										? convertToScript(src)
										: src.endsWith('.css')
										? convertToStyles(src)
										: null;
								if (!tag) {
									throw new Error(`Unable to load script with src ${src}`);
								}

								const container = document.head || document.body;
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
				translationNamespace: `doc-types:${objectType.key}`,
				typeInfo: window.widgets[objectType.key],
			};
		},
	};
}
function convertToScript(src: string) {
	const tag = document.createElement('script');

	tag.type = 'module';
	tag.crossOrigin = 'true';
	tag.src = src;

	return tag;
}
function convertToStyles(src: string) {
	const tag = document.createElement('link');

	tag.rel = 'stylesheet';
	tag.href = src;

	return tag;
}

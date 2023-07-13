import { toFetchApi } from '@principlestudios/openapi-codegen-typescript-fetch';
import operations from '@/api/operations';
import type { StandardResponse } from '@principlestudios/openapi-codegen-typescript';

export const api = toFetchApi(
	operations,
	async (url, req) => {
		const result = await fetch(url, req);
		if (result.status === 401) {
			window.location.href = operations.login.url({
				returnUrl:
					window.location.pathname +
					window.location.search +
					window.location.hash,
			});

			// redirecting; cannot be reached
			throw new Error();
		}
		return result;
	},
	window.location.origin,
);

function wrapApiQuery<
	TArgs extends unknown[],
	TReturn extends StandardResponse,
>(queryKeyPrefix: unknown[], original: (...args: TArgs) => Promise<TReturn>) {
	return (...args: TArgs) => {
		const result = {
			queryKey: [...queryKeyPrefix, { args }] as const,
			queryFn: () => original(...args),
		};
		return result;
	};
}

export const currentUserQuery = () => ({
	queryKey: ['currentUser'],
	queryFn: () => api.getCurrentUser(),
});

export const gameTypesQuery = () => ({
	queryKey: ['gameTypes'],
	queryFn: async () => {
		const response = await api.listGameTypes();
		if (response.statusCode !== 200) return Promise.reject(response);
		return response.data;
	},
});

export const gamesQuery = {
	queryKey: ['game'],
	queryFn: async () => {
		// TODO: this is currently not paginated, but neither is the server-side.
		const response = await api.listGames();
		if (response.statusCode !== 200) return Promise.reject(response);
		return response.data;
	},
};

export const gameQuery = (
	params: Parameters<typeof api.getGameDetails>[0]['params'],
) => wrapApiQuery(['game'], api.getGameDetails)({ params });

export const documentQuery = (
	params: Parameters<typeof api.getDocument>[0]['params'],
) => wrapApiQuery(['document'], api.getDocument)({ params });

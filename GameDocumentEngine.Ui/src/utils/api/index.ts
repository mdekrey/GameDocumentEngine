import { toFetchApi } from '@principlestudios/openapi-codegen-typescript-fetch';
import operations from '@/api/operations';
import type { StandardResponse } from '@principlestudios/openapi-codegen-typescript';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const api = toFetchApi(
	operations,
	async (req) => {
		const result = await fetch(req);
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
>(original: (...args: TArgs) => Promise<TReturn>) {
	return (...args: TArgs) => {
		const result = {
			queryKey: [{ args }] as const,
			queryFn: () => original(...args),
		};
		return result;
	};
}

export const currentUserQuery = () => ({
	queryKey: ['currentUser'],
	queryFn: () => api.getCurrentUser(),
});

export const gameQuery = (
	params: Parameters<typeof api.getGameDetails>[0]['params'],
) => wrapApiQuery(api.getGameDetails)({ params });

export const documentQuery = (
	params: Parameters<typeof api.getDocument>[0]['params'],
) => wrapApiQuery(api.getDocument)({ params });

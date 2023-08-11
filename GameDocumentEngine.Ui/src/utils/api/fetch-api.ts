import { toFetchApi } from '@principlestudios/openapi-codegen-typescript-fetch';
import operations from '@/api/operations';

export const api = toFetchApi(operations, async (url, req) => {
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
});

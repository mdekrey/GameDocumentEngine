import { toFetchApi } from '@principlestudios/openapi-codegen-typescript-fetch';
import operations from '@/api/operations';
import { addMessageId } from './recent-queries';

export const api = toFetchApi(
	operations,
	async (url, req) => {
		const result = await fetch(url, req);
		const messageId = result.headers.get('x-message-id');
		if (messageId) {
			addMessageId(messageId);
		}

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

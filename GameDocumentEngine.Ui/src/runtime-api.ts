import type { QueryClient } from '@tanstack/react-query';
import type { RealtimeApi } from './utils/api/realtime-api';

declare global {
	interface Window {
		vaultApi: RuntimeApi;
	}
}

export type RuntimeApi = {
	disconnectHub(): void;
	reconnectHub(): void;
};
export function setupRuntimeApi({
	realtimeApi,
}: {
	queryClient: QueryClient;
	realtimeApi: RealtimeApi;
}) {
	window.vaultApi = {
		disconnectHub() {
			realtimeApi.sendServiceMessage({
				type: 'forceDisconnect',
			});
		},
		reconnectHub() {
			realtimeApi.sendServiceMessage({
				type: 'forceReconnect',
			});
		},
	};
}

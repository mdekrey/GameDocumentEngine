import { registerSW } from 'virtual:pwa-register';
import type {
	MessageFromServiceWorker,
	MessageFromWindow,
} from '@/service-worker/messages.ts';
import { HubConnectionState } from '@microsoft/signalr';
import { handleEntityChanged } from '@/utils/api/handleEntityChanged.tsx';
import { neverEver } from '@/utils/never-ever.ts';
import type { QueryClient } from '@tanstack/react-query';
import { createContext, useContext } from 'react';
import type { Atom} from 'jotai';
import { atom, getDefaultStore } from 'jotai';

export function createRealtimeApi(queryClient: QueryClient): RealtimeApi {
	const store = getDefaultStore();
	const connectionState$ = atom(HubConnectionState.Connecting);

	registerSW({
		onRegisteredSW() {
			if (!navigator.serviceWorker?.controller) {
				// After a hard refresh, sometimes the `controller` doesn't load
				window.location.reload();
			}
			navigator.serviceWorker?.addEventListener('message', (event) => {
				void handleServiceMessage(event.data as MessageFromServiceWorker);
			});
			sendServiceMessage({ type: 'requestHubState' });
		},
	});

	async function handleServiceMessage(message: MessageFromServiceWorker) {
		switch (message.type) {
			case 'log':
				console.log(`Log from sw:`, ...message.args);
				break;
			case 'entity':
				await handleEntityChanged(
					queryClient,
					message.entityName,
					message.changeEvent,
				);
				break;
			case 'hubState':
				console.log('hubState', message.state);
				store.set(connectionState$, message.state);
				if (message.state === HubConnectionState.Connected)
					await queryClient.invalidateQueries();
				break;
			default:
				return neverEver(message);
		}
	}

	function sendServiceMessage(message: MessageFromWindow) {
		navigator.serviceWorker?.controller?.postMessage(message);
	}

	return {
		connectionState$,
		reconnect() {
			sendServiceMessage({ type: 'requestReconnect' });
			return new Promise<void>((resolve, reject) => {
				store.sub(connectionState$, () => {
					const current = store.get(connectionState$);
					if (current === HubConnectionState.Connected) resolve();
					if (current === HubConnectionState.Disconnected) reject();
				});
			});
		},
		sendServiceMessage,
	};
}

export interface RealtimeApi {
	readonly connectionState$: Atom<HubConnectionState>;
	reconnect(this: void): Promise<void>;
	sendServiceMessage(this: void, message: MessageFromWindow): void;
}

const context = createContext<RealtimeApi | null>(null);

export function useRealtimeApi() {
	const realtimeApiContext = useContext(context);
	if (!realtimeApiContext) throw new Error('No realtime api context provided');
	return realtimeApiContext;
}

export const RealtimeApiProvider = context.Provider;

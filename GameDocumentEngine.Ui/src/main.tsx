/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference no-default-lib="true"/>

import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './main.css';
import { enablePatches } from 'immer';
import { registerSW } from 'virtual:pwa-register';
import { MessageFromServiceWorker } from './service-worker/messages.ts';
import { HubConnectionState } from '@microsoft/signalr';
import { handleEntityChanged } from './utils/api/handleEntityChanged.tsx';
import { neverEver } from './utils/never-ever.ts';

declare global {
	interface WorkerNavigator {
		serviceWorker?: ServiceWorkerContainer;
	}
}

enablePatches();

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: Infinity,
		},
	},
});

registerSW({
	onRegisteredSW() {
		navigator.serviceWorker?.addEventListener('message', (event) => {
			void handleServiceMessage(event.data as MessageFromServiceWorker);
		});
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
			if (message.state === HubConnectionState.Connected)
				await queryClient.invalidateQueries();
			break;
		default:
			return neverEver(message);
	}
}

// TODO - way to request reconnect

export const AppElement = (
	<QueryClientProvider client={queryClient}>
		<StrictMode>
			<App />
		</StrictMode>
		<ReactQueryDevtools initialIsOpen={false} />
	</QueryClientProvider>
);

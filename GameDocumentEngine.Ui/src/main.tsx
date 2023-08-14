/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './main.css';
import { enablePatches } from 'immer';
import {
	RealtimeApiProvider,
	createRealtimeApi,
} from './utils/api/realtime-api.ts';

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

const realtimeApi = createRealtimeApi(queryClient);

export const AppElement = (
	<QueryClientProvider client={queryClient}>
		<RealtimeApiProvider value={realtimeApi}>
			<StrictMode>
				<App />
			</StrictMode>
			<ReactQueryDevtools initialIsOpen={false} />
		</RealtimeApiProvider>
	</QueryClientProvider>
);

import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './main.css';
import { enablePatches } from 'immer';

enablePatches();

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: Infinity,
		},
	},
});

export const AppElement = (
	<QueryClientProvider client={queryClient}>
		<StrictMode>
			<App />
		</StrictMode>
		<ReactQueryDevtools initialIsOpen={false} />
	</QueryClientProvider>
);

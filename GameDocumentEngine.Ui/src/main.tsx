import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './main.css';

const queryClient = new QueryClient();

export const AppElement = (
	<QueryClientProvider client={queryClient}>
		<StrictMode>
			<App />
		</StrictMode>
		<ReactQueryDevtools initialIsOpen={false} />
	</QueryClientProvider>
);

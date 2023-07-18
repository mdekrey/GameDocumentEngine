import { createContext, useContext, useEffect, useMemo } from 'react';
import { createRealtimeApiConnection } from './realtime.signalr';
import type { HubConnection } from '@microsoft/signalr';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { isMessageIdReceived } from './recent-queries';
import { queries } from './queries';
import { UserDetails } from '@/api/models/UserDetails';

type RealtimeApiConnection = {
	connection: HubConnection;
	connectionPromise: Promise<HubConnection>;
	cancellation: AbortSignal;
};

export type RealtimeApi = {
	connectionPromise: Promise<HubConnection>;
	cancellation: AbortSignal;
	// TODO
};

const realtimeApiContext = createContext<undefined | RealtimeApi>(undefined);

export function RealtimeApiProvider({
	children,
}: {
	children?: React.ReactNode;
}) {
	const api = useNewRealtimeApiConnection();
	const queryClient = useQueryClient();
	const realtimeApi = useMemo(
		() => createRealtimeApi(api, queryClient),
		[api, queryClient],
	);

	return (
		<realtimeApiContext.Provider value={realtimeApi}>
			{children}
		</realtimeApiContext.Provider>
	);
}
export function useRealtimeApi() {
	const result = useContext(realtimeApiContext);
	if (!result) throw new Error('Realtime API Provider not installed');
	return result;
}

function useNewRealtimeApiConnection() {
	const api = useMemo(() => createRealtimeApiConnection(), []);

	useEffect(() => {
		return () => api.cancellation.abort();
	});

	return useMemo(
		() => ({
			connectionPromise: api.connectionPromise,
			connection: api.connection,
			cancellation: api.cancellation.signal,
		}),
		[api],
	);
}

function createRealtimeApi(
	api: RealtimeApiConnection,
	queryClient: QueryClient,
): RealtimeApi {
	api.connection.on(
		'UserUpdated',
		(req: { messageId: string; userId: string }) => {
			if (!isMessageIdReceived(req.messageId)) {
				const currentUserQueryKey = queries.getCurrentUser.queryKey;
				if (
					queryClient.getQueryData<UserDetails>(currentUserQueryKey)?.id ===
					req.userId
				)
					void queryClient.invalidateQueries(currentUserQueryKey);
			}
		},
	);

	return {
		connectionPromise: api.connectionPromise,
		cancellation: api.cancellation,
	};
}

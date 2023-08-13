import { createContext, useContext, useEffect, useMemo } from 'react';
import { createRealtimeApiConnection } from './realtime.signalr';
import type { HubConnection } from '@microsoft/signalr';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { handleUserUpdateEvent } from './queries/user';
import { handleDocumentUpdateEvent } from './queries/document';
import { handleGameUpdateEvent } from './queries/games';

type RealtimeApiConnection = {
	connection: HubConnection;
	connectionPromise: Promise<HubConnection>;
	cancellation: AbortSignal;
};

export type RealtimeApi = {
	connectionPromise: Promise<HubConnection>;
	cancellation: AbortSignal;

	// allow messages to be sent by client
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

function apiOn<TMethodName extends string, TEvent>(
	api: RealtimeApiConnection,
	queryClient: QueryClient,
	methodName: TMethodName,
	callback: (
		queryClient: QueryClient,
		req: TEvent,
		methodName: TMethodName,
	) => void | Promise<void>,
) {
	api.connection.on(methodName, doCallbackIgnorePromises);
	return () => api.connection.off(methodName, doCallbackIgnorePromises);

	function doCallbackIgnorePromises(req: TEvent) {
		void callback(queryClient, req, methodName);
	}
}

function createRealtimeApi(
	api: RealtimeApiConnection,
	queryClient: QueryClient,
): RealtimeApi {
	apiOn(api, queryClient, 'User', handleUserUpdateEvent);
	apiOn(api, queryClient, 'Game', handleGameUpdateEvent);
	apiOn(api, queryClient, 'Document', handleDocumentUpdateEvent);

	return {
		connectionPromise: api.connectionPromise,
		cancellation: api.cancellation,
	};
}

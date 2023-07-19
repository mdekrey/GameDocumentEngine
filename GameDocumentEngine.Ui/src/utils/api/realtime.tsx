import { createContext, useContext, useEffect, useMemo } from 'react';
import { createRealtimeApiConnection } from './realtime.signalr';
import type { HubConnection } from '@microsoft/signalr';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { isMessageIdReceived } from './recent-queries';
import { invalidateCurrentUser } from './queries/user';
import { invalidateDocument } from './queries/document';
import { invalidateGame, invalidateGameList } from './queries/games';

type RealtimeApiConnection = {
	connection: HubConnection;
	connectionPromise: Promise<HubConnection>;
	cancellation: AbortSignal;
};

export type RealtimeApi = {
	connectionPromise: Promise<HubConnection>;
	cancellation: AbortSignal;
	// TODO: allow messages to be sent by client, or allow registering/unregistering of listeners

	subscribeToGame(gameId: string): Promise<void>;
	refreshDocumentSubscription(
		gameId: string,
		documentId: string,
	): Promise<void>;
	unsubscribeFromGame(gameId: string): Promise<void>;
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

function apiOn<T>(
	api: RealtimeApiConnection,
	queryClient: QueryClient,
	methodName: string,
	callback: (queryClient: QueryClient, req: T) => void | Promise<void>,
) {
	api.connection.on(methodName, callbackWithCheck);
	return () => api.connection.off(methodName, callbackWithCheck);

	function callbackWithCheck(req: T & { messageId: string }) {
		if (!isMessageIdReceived(req.messageId)) void callback(queryClient, req);
	}
}

function createRealtimeApi(
	api: RealtimeApiConnection,
	queryClient: QueryClient,
): RealtimeApi {
	apiOn(api, queryClient, 'UserUpdated', invalidateCurrentUser);
	apiOn(api, queryClient, 'GameChanged', invalidateGame);
	apiOn(api, queryClient, 'GameDeleted', invalidateGame);
	apiOn(api, queryClient, 'GameListChanged', invalidateGameList);
	apiOn(api, queryClient, 'DocumentAdded', invalidateDocument);
	apiOn(api, queryClient, 'DocumentChanged', invalidateDocument);
	apiOn(api, queryClient, 'DocumentDeleted', invalidateDocument);

	return {
		connectionPromise: api.connectionPromise,
		cancellation: api.cancellation,

		async subscribeToGame(gameId: string) {
			const connection = await api.connectionPromise;
			await connection.send('SubscribeToGame', { gameId });
		},
		async refreshDocumentSubscription(gameId: string, documentId: string) {
			const connection = await api.connectionPromise;
			await connection.send('RefreshDocumentSubscription', {
				gameId,
				documentId,
			});
		},
		async unsubscribeFromGame(gameId: string) {
			const connection = await api.connectionPromise;
			await connection.send('UnsubscribeFromGame', { gameId });
		},
	};
}

import { useRealtimeApi } from '@/utils/api/realtime-api';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { HubConnectionState } from '@microsoft/signalr';

export function useReconnectOnLoad() {
	const store = useStore();
	const { connectionState$: connectionState, reconnect } = useRealtimeApi();

	useEffect(() => {
		const initialState = store.get(connectionState);
		if (initialState === HubConnectionState.Disconnected) {
			void reconnect();
		}
	}, [store, connectionState, reconnect]);
}

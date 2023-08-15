import { useRealtimeApi } from '@/utils/api/realtime-api';
import { NetworkIndicatorProps } from './network-indicator';

export function useNetworkIndicator(): NetworkIndicatorProps {
	const { connectionState$: connectionState, reconnect: onReconnect } =
		useRealtimeApi();

	return { connectionState, onReconnect };
}

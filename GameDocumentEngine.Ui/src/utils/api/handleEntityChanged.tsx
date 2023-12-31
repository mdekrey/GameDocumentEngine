import type { QueryClient } from '@tanstack/react-query';
import type { EntityChangedProps } from './EntityChangedProps';
import { handleUserUpdateEvent } from './queries/user';
import { handleDocumentUpdateEvent } from './queries/document';
import { handleGameUpdateEvent } from './queries/games';
import type { RealtimeApi } from './realtime-api';

type RealtimeMessageHandler<TKey, TValue> = (
	queryClient: QueryClient,
	event: EntityChangedProps<TKey, TValue>,
	realtimeApi: RealtimeApi,
) => void | Promise<void>;

export const messageHandlers: Record<
	string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	RealtimeMessageHandler<any, any>
> = {
	User: handleUserUpdateEvent,
	Game: handleGameUpdateEvent,
	Document: handleDocumentUpdateEvent,
};

export async function handleEntityChanged(
	queryClient: QueryClient,
	entityName: string,
	changeEvent: EntityChangedProps<unknown, unknown>,
	realtimeApi: RealtimeApi,
) {
	await messageHandlers[entityName]?.(queryClient, changeEvent, realtimeApi);
}

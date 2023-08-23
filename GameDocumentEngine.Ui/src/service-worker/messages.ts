import type { EntityChangedProps } from '@/utils/api/EntityChangedProps';
import type { HubConnectionState } from '@microsoft/signalr';

export type RequestHubStateMessage = {
	type: 'requestHubState';
};
export type RequestReconnectMessage = {
	type: 'requestReconnect';
};

export type LogMessage = {
	type: 'log';
	args: readonly unknown[];
};

export type HubStatusMesage = {
	type: 'hubState';
	state: HubConnectionState;
};

export type EntityChangedMessage = {
	type: 'entity';

	entityName: string;
	changeEvent: EntityChangedProps<unknown, unknown>;
};

export type MessageFromWindow =
	| RequestHubStateMessage
	| RequestReconnectMessage;
export type MessageFromServiceWorker =
	| LogMessage
	| HubStatusMesage
	| EntityChangedMessage;

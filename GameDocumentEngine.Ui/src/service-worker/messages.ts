import type { EntityChangedProps } from '@/utils/api/EntityChangedProps';
import type { HubConnectionState } from '@microsoft/signalr';

export type RequestHubStateMessage = {
	type: 'requestHubState';
};
export type RequestReconnectMessage = {
	type: 'requestReconnect';
};
export type ForceDisconnectMessage = {
	type: 'forceDisconnect';
};
export type ForceReconnectMessage = {
	type: 'forceReconnect';
};
export type VerifyUserMessage = {
	type: 'verifyUser';
	userId: string;
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
	| RequestReconnectMessage
	| ForceDisconnectMessage
	| ForceReconnectMessage
	| VerifyUserMessage;
export type MessageFromServiceWorker =
	| LogMessage
	| HubStatusMesage
	| EntityChangedMessage
	| VerifyUserMessage;

import { EntityChangedProps } from '@/utils/api/EntityChangedProps';
import { HubConnectionState } from '@microsoft/signalr';

export type RequestHubStateMessage = {
	type: 'requestHubState';
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

export type MessageFromWindow = RequestHubStateMessage;
export type MessageFromServiceWorker =
	| LogMessage
	| HubStatusMesage
	| EntityChangedMessage;

import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { createRealtimeApiConnection } from './utils/api/realtime.signalr';
import type {
	HubStatusMesage,
	MessageFromServiceWorker,
	MessageFromWindow,
} from './service-worker/messages';
import { neverEver } from './utils/never-ever';
import { HubConnectionState } from '@microsoft/signalr';

declare const self: ServiceWorkerGlobalScope;

if (import.meta.env.PROD) {
	precacheAndRoute(self.__WB_MANIFEST);
}
cleanupOutdatedCaches();
clientsClaim();

const version = 1;

const { connection, connectionPromise } = createRealtimeApiConnection();

type SendToFunction = {
	(client: Client, message: MessageFromServiceWorker): void;
	(message: MessageFromServiceWorker): (client: Client) => void;
};

const sendTo: SendToFunction = function sendTo(
	...args: [Client, MessageFromServiceWorker] | [MessageFromServiceWorker]
) {
	if (args.length === 1) {
		const [message] = args;
		return (client) => client.postMessage(message);
	} else {
		const [client, message] = args;
		client.postMessage(message);
		return;
	}
} as SendToFunction;

async function sendToAll(message: MessageFromServiceWorker) {
	await self.clients
		.matchAll()
		.then((clients) => clients.forEach(sendTo(message)));
}

function log(...args: unknown[]) {
	console.log(`[${new Date().toISOString()}] sw${version}`, ...args);
	// void sendToAll({ type: 'log', args });
}

self.addEventListener('install', function (e) {
	e.waitUntil(
		(async () => {
			log('installing');
			await self.skipWaiting();
			log('installed');
		})(),
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			log('activating');
			await self.clients.claim();
			log('connection', connection.state);
			connection.on('EntityChanged', (...args) => {
				void sendToAll({
					type: 'entity',
					entityName: args[0],
					changeEvent: args[1],
				});
			});
			connection.onclose((err) => {
				console.error('onclose', err);
				void sendToAll(getHubStateMessage());
			});
			connection.onreconnecting((err) => {
				console.error('onreconnecting', err);
				void sendToAll(getHubStateMessage());
			});
			connection.onreconnected(() => {
				void sendToAll(getHubStateMessage());
			});
			await connectionPromise;
			void sendToAll(getHubStateMessage());
			log('activated');
		})(),
	);
});

self.addEventListener('message', (ev) => {
	log('received message', ev.data);
	handleMessageFromWindow(ev.source as Client, ev.data as MessageFromWindow);
});

function handleMessageFromWindow(source: Client, data: MessageFromWindow) {
	switch (data.type) {
		case 'requestHubState':
			sendTo(source, getHubStateMessage());
			return;
		case 'requestReconnect':
			if (connection.state === HubConnectionState.Disconnected) {
				void connection
					.start()
					.finally(() => void sendToAll(getHubStateMessage()));
				void sendToAll(getHubStateMessage());
			}
			break;
		default:
			return neverEver(data);
	}
}

function getHubStateMessage(): HubStatusMesage {
	return {
		type: 'hubState',
		state: connection.state,
	};
}

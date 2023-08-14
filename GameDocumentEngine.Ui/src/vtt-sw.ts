/// <reference no-default-lib="true" />
/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { createRealtimeApiConnection } from './utils/api/realtime.signalr';
import {
	HubStatusMesage,
	MessageFromServiceWorker,
	MessageFromWindow,
} from './service-worker/messages';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

const version = 1.1;

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
	void sendToAll({ type: 'log', args });
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
			log(connection, connection.state);
			connection.on('EntityChanged', (...args) => {
				void sendToAll({
					type: 'entity',
					entityName: args[0],
					changeEvent: args[1],
				});
			});
			connection.onclose(() => {
				void sendToAll(getHubStateMessage());
			});
			connection.onreconnecting(() => {
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
	}
}

function getHubStateMessage(): HubStatusMesage {
	return {
		type: 'hubState',
		state: connection.state,
	};
}

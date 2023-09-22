import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { createRealtimeApiConnection } from './utils/api/realtime.signalr';
import type {
	HubStatusMesage,
	MessageFromServiceWorker,
	MessageFromWindow,
	VerifyUserMessage,
} from './service-worker/messages';
import { neverEver } from './utils/never-ever';
import { HubConnection, HubConnectionState } from '@microsoft/signalr';
/// <reference types="vite/client" />

declare const self: ServiceWorkerGlobalScope;

const gitHash: string = import.meta.env.VITE_GITHASH ?? 'HEAD';

if (import.meta.env.PROD) {
	precacheAndRoute(self.__WB_MANIFEST);
}
cleanupOutdatedCaches();
clientsClaim();

let userId = '';
let expectedUserId = '';

const { connection, connectionPromise } =
	createRealtimeApiConnection(setupConnection);

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
	console.log(
		`[${new Date().toISOString()}] @${gitHash.substring(0, 8)}`,
		...args,
	);
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
			setupConnection(connection);
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

function setupConnection(connection: HubConnection) {
	connection.off('User');
	connection.on('User', (incomingUserId: string) => {
		userId = incomingUserId;
		if (expectedUserId && userId !== expectedUserId) {
			// user id mismatch
			void sendToAll(checkUserId(userId));
		}
	});
	connection.off('EntityChanged');
	connection.on('EntityChanged', (...args) => {
		void sendToAll({
			type: 'entity',
			entityName: args[0],
			changeEvent: args[1],
		});
	});
	connection.off('GitHash');
	connection.on('GitHash', (serverGitHash) => {
		if (serverGitHash !== gitHash) {
			void self.registration.update();
		}
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
}

function handleMessageFromWindow(source: Client, data: MessageFromWindow) {
	switch (data.type) {
		case 'requestHubState':
			sendTo(source, getHubStateMessage());
			return;
		case 'requestReconnect':
			if (connection.state === HubConnectionState.Disconnected) {
				setupConnection(connection);
				void connection.start().finally(() => {
					void sendToAll(getHubStateMessage());
				});
				void sendToAll(getHubStateMessage());
			}
			break;
		case 'forceReconnect':
			forceReconnect();
			break;
		case 'verifyUser':
			expectedUserId = data.userId;
			if (
				connection.state === HubConnectionState.Connected &&
				data.userId !== userId
			) {
				forceReconnect();
			}
			break;
		default:
			return neverEver(data);
	}
}

function forceReconnect() {
	// To trigger this, run this in the console:
	// navigator.serviceWorker?.controller?.postMessage({type: 'forceReconnect' });
	// This will allow you to see WS communication
	if (connection.state !== HubConnectionState.Disconnected) {
		void (async function () {
			await connection.stop();
			setupConnection(connection);
			void connection.start().finally(() => {
				void sendToAll(getHubStateMessage());
			});
			void sendToAll(getHubStateMessage());
		})();
	}
}

function getHubStateMessage(): HubStatusMesage {
	return {
		type: 'hubState',
		state: connection.state,
	};
}

function checkUserId(userId: string): VerifyUserMessage {
	return {
		type: 'verifyUser',
		userId,
	};
}

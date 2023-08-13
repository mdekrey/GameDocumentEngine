import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { createRealtimeApiConnection } from './utils/api/realtime.signalr';

declare const self: Window & typeof globalThis & ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.addEventListener('activate', (event) => {
	const { cancellation, connection, connectionPromise } =
		createRealtimeApiConnection();
	console.log(connection);
	connection.on('User', (...args) => console.log('User', args));
});

declare global {
	interface Window {
		vaultApi: RuntimeApi;
	}
}

export type RuntimeApi = {
	reconnectHub(): void;
};

window.vaultApi = {
	reconnectHub() {
		navigator.serviceWorker?.controller?.postMessage({
			type: 'forceReconnect',
		});
	},
};

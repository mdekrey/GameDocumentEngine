declare global {
	interface Window {
		widgets: Record<string, unknown>;
	}
}

export function defineDocument(name: string, component: React.ComponentType) {
	window.widgets ??= {};
	window.widgets[name] = component;
}

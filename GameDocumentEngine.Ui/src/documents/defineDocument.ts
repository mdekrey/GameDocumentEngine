export type IGameObjectType = {
	template: Record<string, unknown>;
	component: React.ComponentType;
};

declare global {
	interface Window {
		widgets: Record<string, IGameObjectType>;
	}
}

export function defineDocument(
	name: string,
	objectTypeDefinition: IGameObjectType,
) {
	window.widgets ??= {};
	window.widgets[name] = objectTypeDefinition;
}

import { DocumentDetails } from '@/api/models/DocumentDetails';
import { UseQueryResult } from '@tanstack/react-query';
import { Draft } from 'immer';

export type TypedDocumentDetails<T> = Omit<DocumentDetails, 'details'> & {
	details: T;
};

export type EditableDocumentDetails<T = unknown> = {
	name: string;
	details: T;
};

export type GameObjectWidgetProps<T = unknown> = {
	gameId: string;
	documentId: string;
	document: UseQueryResult<TypedDocumentDetails<T>>;
	onUpdateDocument: (
		updates: (draft: Draft<EditableDocumentDetails<T>>) => void,
	) => void;
	onDeleteDocument: () => void;
};

export type IGameObjectType<T = unknown> = {
	template: T;
	component: React.ComponentType<GameObjectWidgetProps<T>>;
};

declare global {
	interface Window {
		widgets: Record<string, IGameObjectType>;
	}
}

export function defineDocument<T>(
	name: string,
	objectTypeDefinition: IGameObjectType<T>,
) {
	window.widgets ??= {};
	window.widgets[name] = objectTypeDefinition as IGameObjectType;
}

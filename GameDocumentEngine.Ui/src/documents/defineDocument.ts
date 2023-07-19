import { DocumentDetails } from '@/api/models/DocumentDetails';
import { UseQueryResult } from '@tanstack/react-query';
import { Draft } from 'immer';
import type { IconType } from 'react-icons';
import { z } from 'zod';

export type TypedDocumentDetails<T> = Omit<DocumentDetails, 'details'> & {
	details: T;
};

export type EditableDocumentDetails<T = unknown> = {
	name: string;
	details: T;
};

export type Updater<T> = (
	updates: (draft: Draft<EditableDocumentDetails<T>>) => void,
) => void;

export type GameObjectWidgetProps<T = unknown> = {
	gameId: string;
	documentId: string;
	document: UseQueryResult<TypedDocumentDetails<T>>;
	onUpdateDocument: Updater<T>;
	onDeleteDocument: () => void;
};

export type IGameObjectType<T = unknown> = {
	icon: IconType;
	template: T;
	component: React.ComponentType<GameObjectWidgetProps<T>>;
};

declare global {
	interface Window {
		widgets: Record<string, IGameObjectType>;
	}
}

export function documentSchema<T>(
	schema: z.ZodType<T>,
): z.ZodType<EditableDocumentDetails<T>> {
	return z.object({
		name: z.string().nonempty(),
		details: schema as z.ZodAny,
	}) as z.ZodType<EditableDocumentDetails<T>>;
}

export function defineDocument<T>(
	name: string,
	objectTypeDefinition: IGameObjectType<T>,
) {
	window.widgets ??= {};
	window.widgets[name] = objectTypeDefinition as IGameObjectType;
}

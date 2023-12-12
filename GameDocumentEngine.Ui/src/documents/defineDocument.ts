import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { FieldMapping } from '@/utils/form';
import type { UseFormResult } from '@/utils/form';
import type { QueryObserverSuccessResult } from '@tanstack/react-query';
import type { TFunction } from 'i18next';
import type { Draft } from 'immer';
import type { IconType } from 'react-icons';
import { ZodObject, z } from 'zod';
import type { DocumentPointers } from './get-document-pointers';
import type { UserDetails } from '@/api/models/UserDetails';
import type {
	GameTypeObjectScripts,
	GameTypeScripts,
} from '@/utils/api/queries/game-types';

export type TypedDocumentDetails<T> = Omit<DocumentDetails, 'details'> & {
	details: T;
};

export type EditableDocumentDetails<T = unknown> = {
	name: string;
	details: T;
};

export type Updater<T> = (
	updates: (draft: Draft<EditableDocumentDetails<T>>) => void,
) => Promise<void>;

export type GameObjectWidgetProps<T = unknown> = {
	gameId: string;
	documentId: string;
	document: QueryObserverSuccessResult<TypedDocumentDetails<T>>;
	onUpdateDocument: Updater<T>;
	translation: TFunction;
};

export type GameObjectComponentBase<T = unknown> = {
	document: TypedDocumentDetails<T>;
	translation: TFunction;
	user: UserDetails;
	gameType: GameTypeScripts;
	docType: GameTypeObjectScripts<T>;
};

export type GameObjectFormComponent<T> = GameObjectComponentBase<T> & {
	readablePointers: DocumentPointers;
	writablePointers: DocumentPointers;
	form: UseFormResult<EditableDocumentDetails<T>>;
	onSubmit: (document: EditableDocumentDetails<T>) => Promise<void>;
};

export type Size = {
	width: number;
	height: number;
};
export type WidgetComponentProps<T> = GameObjectComponentBase<T> & {
	size: Size;
};

export type GameObjectWidgetDefinition<T> = {
	defaults: Size;
	component: React.ComponentType<WidgetComponentProps<T>>;
	translationNamespace?: string;
	translationKeyPrefix: string;
	getConstraints(gameObjectType: IGameObjectType<T>): {
		min: Size;
		max?: Partial<Size>;
	};
};

export type IGameObjectType<T = unknown> = {
	noContainer?: boolean;
	icon: IconType;
	template: T;
	component: React.ComponentType<GameObjectFormComponent<T>>;
	fixup: FieldMapping<EditableDocumentDetails<T>, EditableDocumentDetails<T>>;
	schema: z.ZodType<T>;
	widgets?: Record<string, GameObjectWidgetDefinition<T>>;
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
		name: z.string().min(1),
		details: schema instanceof ZodObject ? schema.deepPartial() : schema,
	}) as z.ZodType<EditableDocumentDetails<T>>;
}

export function defineDocument<T>(
	name: string,
	objectTypeDefinition: IGameObjectType<T>,
) {
	window.widgets ??= {};
	window.widgets[name] = objectTypeDefinition as IGameObjectType;
}

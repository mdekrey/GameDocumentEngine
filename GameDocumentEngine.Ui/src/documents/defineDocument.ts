import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { FieldMapping, FormFieldReturnType } from '@/utils/form';
import type { UseFormResult } from '@/utils/form';
import type { QueryObserverSuccessResult } from '@tanstack/react-query';
import type { TFunction } from 'i18next';
import type { Draft } from 'immer';
import type { IconType } from 'react-icons';
import { ZodObject, z } from 'zod';
import type { DocumentPointers } from './get-document-pointers';

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

export type GameObjectFormComponent<T = unknown> = {
	gameId: string;
	form: UseFormResult<EditableDocumentDetails<T>>;
	onSubmit: (document: EditableDocumentDetails<T>) => Promise<void>;
	translation: TFunction;
	readablePointers: DocumentPointers;
	writablePointers: DocumentPointers;
	objectRole: string | undefined;
};

export type WidgetSettingsProps<T, TSettings> = {
	document: TypedDocumentDetails<T>;
	field: FormFieldReturnType<TSettings>;
	translation: TFunction;
};

export type GameObjectWidgetDefinition<T, TSettings> = {
	defaults: {
		width: number;
		height: number;
		settings: TSettings;
	};
	component: React.ComponentType<GameObjectFormComponent<T>>;
	settingsComponent: TSettings extends void
		? null
		: React.ComponentType<WidgetSettingsProps<T, TSettings>>;
};

export type IGameObjectType<T = unknown> = {
	noContainer?: boolean;
	icon: IconType;
	template: T;
	component: React.ComponentType<GameObjectFormComponent<T>>;
	fixup: FieldMapping<EditableDocumentDetails<T>, EditableDocumentDetails<T>>;
	schema: z.ZodType<T>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	widgets?: Record<string, GameObjectWidgetDefinition<T, any>>;
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

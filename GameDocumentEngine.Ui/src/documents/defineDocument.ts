import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { FieldMapping, FormFieldReturnType } from '@/utils/form';
import type { UseFormResult } from '@/utils/form';
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

export type GameObjectComponentBase<T = unknown> = {
	document: TypedDocumentDetails<T>;
};

export type GameObjectFormComponent<T> = GameObjectComponentBase<T> & {
	readablePointers: DocumentPointers;
	writablePointers: DocumentPointers;
	form: UseFormResult<EditableDocumentDetails<T>>;
	onSubmit: (document: EditableDocumentDetails<T>) => Promise<void>;
};

export type NewGameObjectFieldComponent<T> = {
	templateField: FormFieldReturnType<T>;
};

export type Size = {
	width: number;
	height: number;
};

export type WidgetBase = void | object;
export type WidgetSettings<TWidget extends WidgetBase> = TWidget extends object
	? TWidget
	: Record<string, never>;
export type WidgetComponentProps<
	T,
	TWidget extends WidgetBase,
> = GameObjectComponentBase<T> & {
	widgetType: string;
	size: Size;
	widgetSettings: WidgetSettings<TWidget>;
};
export type WidgetSettingsComponentProps<
	T,
	TWidget extends WidgetBase,
> = GameObjectComponentBase<T> & {
	size: Size;
	field: UseFormResult<WidgetSettings<TWidget>>;
};

export type GameObjectWidgetSettings<T, TWidget extends object> = {
	schema: z.ZodType<WidgetSettings<TWidget>>;
	component: React.ComponentType<WidgetSettingsComponentProps<T, TWidget>>;
	default: WidgetSettings<TWidget>;
};

export type GameObjectWidgetDefinition<
	T = unknown,
	TWidget extends WidgetBase = void,
> = {
	defaults: Size;
	component: React.ComponentType<WidgetComponentProps<T, TWidget>>;
	translationNamespace?: string;
	translationKeyPrefix: string;
	getConstraints(widgetSettings: WidgetSettings<TWidget>): {
		min: Size;
		max?: Partial<Size>;
	};
	settings: TWidget extends object
		? GameObjectWidgetSettings<T, TWidget>
		: null;
};

export type IGameObjectType<T = unknown> = {
	noContainer?: boolean;
	icon: IconType;
	template: T;
	component: React.ComponentType<GameObjectFormComponent<T>>;
	creationComponent?: React.ComponentType<NewGameObjectFieldComponent<T>>;
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

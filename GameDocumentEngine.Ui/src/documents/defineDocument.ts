import type { DocumentDetails } from '@/api/models/DocumentDetails';
import { FieldMapping } from '@/utils/form/useField';
import { UseFormResult } from '@/utils/form/useForm';
import { i18n } from '@/utils/i18n/setup';
import type { QueryObserverSuccessResult } from '@tanstack/react-query';
import type { TFunction } from 'i18next';
import type { Draft } from 'immer';
import type { IconType } from 'react-icons';
import { z } from 'zod';
import { DocumentPointers } from './get-document-pointers';

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
	translation: TFunction<`doc-types:${string}`, undefined>;
};

export type GameObjectFormComponent<T = unknown> = {
	form: UseFormResult<EditableDocumentDetails<T>>;
	onSubmit: (document: EditableDocumentDetails<T>) => Promise<void>;
	translation: TFunction<`doc-types:${string}`, undefined>;
	readablePointers: DocumentPointers;
	writablePointers: DocumentPointers;
	objectRole: string | undefined;
};

export type IGameObjectType<T = unknown> = {
	icon: IconType;
	template: T;
	component: React.ComponentType<GameObjectFormComponent<T>>;
	translations: Record<string, Record<string, unknown>>;
	fixup: FieldMapping<EditableDocumentDetails<T>, EditableDocumentDetails<T>>;
	schema: z.ZodType<T>;
	widgets?: Record<string, GameObjectWidgetProps<T>>;
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
		details: schema,
	}) as z.ZodType<EditableDocumentDetails<T>>;
}

export function defineDocument<T>(
	name: string,
	objectTypeDefinition: IGameObjectType<T>,
) {
	window.widgets ??= {};
	window.widgets[name] = objectTypeDefinition as IGameObjectType;

	const translationNamespace = `doc-types:${name}`;
	for (const [language, resources] of Object.entries(
		objectTypeDefinition.translations,
	)) {
		i18n.addResourceBundle(language, translationNamespace, resources);
	}
}

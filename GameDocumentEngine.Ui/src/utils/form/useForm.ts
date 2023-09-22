/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { Atom } from 'jotai';
import { atom, useStore } from 'jotai';
import type { MutableRefObject } from 'react';
import type React from 'react';
import { useMemo } from 'react';
import type { ZodError, ZodType } from 'zod';
import type { StandardWritableAtom } from './StandardWritableAtom';
import type { AnyPath, Path, PathValue } from './path';
import type { Patch, Objectish } from 'immer';
import { applyPatches } from 'immer';
import type {
	FieldOptions,
	FieldMapping,
	UseFieldResult,
	UseFieldResultFlags,
	FieldStateCallback,
} from './useField';
import { toInternalFieldAtom } from './toInternalFieldAtom';
import { createTriggeredErrorsAtom } from './createErrorsAtom';
import type { Loadable } from 'jotai/vanilla/utils/loadable';
import type { AnyArray } from './arrays';
import type { ErrorsStrategy, RegisterErrorStrategy } from './errorsStrategy';
import { errorsStrategy } from './errorsStrategy';
import { FormEvents } from './events/FormEvents';
import { atomFamily as createAtomFamily } from 'jotai/utils';
import { getZodSchemaForPath } from './getZodSchemaForPath';
import type {
	FieldConfigOrPath,
	FieldsConfig,
	FieldConfig,
	FieldConfigToType,
	FieldStateOverride,
} from './field-config-types';
import { toConfigObject } from './field-config-types';
import { getValueAtPath, getAtomForPath } from './getAtomForPath';
import { mapAtom, noChange } from './mapAtom';
import {
	FieldStateAtom,
	FieldStatePrimitive,
	PerFieldState,
	toAtomFieldState,
	walkFieldStateAtom,
	toFieldStateValue,
} from './fieldStateTracking';

export type ConfiguredFormField<
	TValue,
	TArgs extends null | AnyArray,
	TFlags extends UseFieldResultFlags,
> = TArgs extends AnyArray
	? (...args: TArgs) => UseFieldResult<TValue, TFlags>
	: UseFieldResult<TValue, TFlags>;

type DefaultFormFieldResultFlags = {
	hasErrors: true;
	hasTranslations: true;
};
type FlagsForFormFieldConfig<
	T,
	// keeping the type param for future use
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	TFieldConfig extends FieldConfigOrPath<T>,
> = DefaultFormFieldResultFlags;
// example usage for how these flags work
// isCheckbox: TFieldConfig extends { readonly isCheckbox?: boolean }
// 	? IfTrueThenElse<TFieldConfig['isCheckbox'], true, false>
// 	: false;

export type FormFieldReturnType<
	T,
	TFlags extends UseFieldResultFlags = DefaultFormFieldResultFlags,
> = UseFieldResult<T, TFlags> & UseFormResult<T>;

type FormFieldReturnTypeFromConfig<
	T,
	TFieldConfig extends FieldConfigOrPath<T>,
> = FormFieldReturnType<
	FieldConfigToType<T, TFieldConfig>,
	FlagsForFormFieldConfig<T, TFieldConfig>
>;

export type FormFields<T, TFields extends FieldsConfig<T>> = {
	[K in keyof TFields]: TFields[K] extends FieldConfigOrPath<T>
		? FormFieldReturnTypeFromConfig<T, TFields[K]>
		: TFields[K] extends (...args: infer TArgs) => infer TReturn
		? TReturn extends FieldConfigOrPath<T>
			? (...args: TArgs) => FormFieldReturnTypeFromConfig<T, TReturn>
			: never
		: never;
};

export type FormOptions<T> = {
	schema: ZodType<T>;
	defaultValue: T;
	translation: (field: string) => string;
	preSubmit?: ErrorsStrategy;
	postSubmit?: ErrorsStrategy;
	disabled?: PerFieldState<boolean>;
	readOnly?: PerFieldState<boolean>;
};
export type FormFieldsOptions<T, TFields extends FieldsConfig<T>> = {
	fields: TFields;
};

export type AtomFamily<T> = <TPath extends Path<T>>(
	path: TPath,
) => StandardWritableAtom<PathValue<T, TPath>>;

export interface UseFormResult<T> {
	pathPrefix: AnyPath;
	translationPath: AnyPath;
	store: ReturnType<typeof useStore>;
	atom: StandardWritableAtom<T>;
	atomFamily: AtomFamily<T>;
	schema: ZodType<T>;
	errors: Atom<Loadable<ZodError<T> | null>>;
	formEvents: FormEvents;
	defaultValue: React.MutableRefObject<T>;
	disabledFields: FieldStateAtom<boolean>;
	readOnlyFields: FieldStateAtom<boolean>;
	formTranslation: (field: string) => string;
	field<TPath extends Path<T>>(
		path: TPath,
	): FormFieldReturnType<PathValue<T, TPath>, DefaultFormFieldResultFlags>;
	updateAllErrors(this: void): void;

	get(this: void): T;
	set(this: void, value: T | ((prevValue: T) => T)): void;
	handleSubmit(
		this: void,
		callback: (value: T) => void | Promise<void>,
	): (ev?: React.SyntheticEvent<unknown>) => void;
	errorStrategy: RegisterErrorStrategy;
}

export type UseFieldsResult<
	T,
	TFields extends FieldsConfig<T> = Record<never, never>,
> = {
	fields: FormFields<T, TFields>;
};

export type UseFormResultWithFields<
	T,
	TFields extends FieldsConfig<T> = Record<never, never>,
> = UseFormResult<T> & UseFieldsResult<T, TFields>;

type BuildFormResultOptions<T> = {
	pathPrefix: AnyPath;
	translationPath: AnyPath;
	store: ReturnType<typeof useStore>;
	atom: StandardWritableAtom<T>;
	atomFamily: AtomFamily<T>;
	schema: ZodType<T>;
	formEvents: FormEvents;
	errorStrategy: RegisterErrorStrategy;
	formTranslation: (key: string) => string;
	defaultValue: MutableRefObject<T>;
	disabledFields: FieldStateAtom<boolean>;
	readOnlyFields: FieldStateAtom<boolean>;
};

function buildFormResult<T>({
	pathPrefix,
	translationPath,
	store,
	atom,
	atomFamily,
	schema,
	formEvents,
	errorStrategy,
	formTranslation,
	defaultValue,
	disabledFields,
	readOnlyFields,
}: BuildFormResultOptions<T>): UseFormResult<T> {
	const [errors, trigger] = createTriggeredErrorsAtom(atom, schema);
	errorStrategy(formEvents, () => store.set(trigger));
	const formContext: FormResultContext<T> = {
		pathPrefix,
		translationPath,
		schema,
		errorStrategy,
		formTranslation,
		store,
		atom,
		atomFamily,
		defaultValue,
		formEvents,
		disabledFields,
		readOnlyFields,
	};
	return {
		...formContext,
		atom,
		errors,
		field<TPath extends Path<T>>(
			path: TPath,
		): FormFieldReturnType<PathValue<T, TPath>, DefaultFormFieldResultFlags> {
			return toField<T, TPath, PathValue<T, TPath>>({ path }, formContext);
		},
		updateAllErrors() {
			formEvents.dispatchEvent(FormEvents.UpdateAllErrors);
		},
		get: () => store.get(atom),
		set: (value: T) => store.set(atom, value),
		handleSubmit: (callback) => async (event) => {
			formEvents.dispatchEvent(FormEvents.Submit);
			event?.preventDefault();
			const data = store.get(atom);
			const errorsResult = await schema.safeParseAsync(data);
			if (!errorsResult.success) {
				return;
			}
			await callback(errorsResult.data);
		},
	};
}

type FormResultContext<T> = Pick<
	UseFormResult<T>,
	| 'atom'
	| 'pathPrefix'
	| 'translationPath'
	| 'schema'
	| 'errorStrategy'
	| 'formTranslation'
	| 'store'
	| 'atomFamily'
	| 'defaultValue'
	| 'formEvents'
	| 'disabledFields'
	| 'readOnlyFields'
>;

export function buildFormFields<
	T,
	TFields extends FieldsConfig<T> = Record<never, never>,
>(fields: TFields, params: FormResultContext<T>): FormFields<T, TFields> {
	return Object.fromEntries(
		Object.entries(fields).map(([field, config]) => {
			return [
				field,
				typeof config === 'function'
					? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					  (...args: AnyArray) => innerToField(config(...args))
					: innerToField(config),
			];
		}),
	) as never as FormFields<T, TFields>;

	function innerToField(config: FieldConfigOrPath<T>) {
		return toField<T, Path<T>, unknown>(
			toConfigObject<T, unknown, FieldConfigOrPath<T, unknown>>(
				config,
			) as FieldConfig<T, Path<T>, unknown>,
			params,
		);
	}
}

function toField<T, TPath extends Path<T>, TValue>(
	config: FieldConfig<T, TPath, TValue>,
	context: FormResultContext<T>,
): FormFieldReturnType<TValue, DefaultFormFieldResultFlags> {
	const result = toFormSubset<T, TPath, TValue>(config, context);
	const options: Partial<FieldOptions<PathValue<T, TPath>, TValue>> = {
		mapping: config.mapping,
		schema: getZodSchemaForPath(config.path, context.schema),
		errorStrategy: context.errorStrategy,
		formEvents: context.formEvents,
		translation: (part) =>
			context.formTranslation(
				[
					'fields',
					...context.translationPath,
					...(config.translationPath ?? (config.path as AnyPath)),
					...(typeof part === 'string' ? [part] : part),
				].join('.'),
			),
		disabled: substateAtom(config.disabled, context.disabledFields),
		readOnly: substateAtom(config.readOnly, context.readOnlyFields),
	};
	const unmappedAtom = context.atomFamily(config.path as Path<T>);
	const fieldResult = toInternalFieldAtom<PathValue<T, TPath>, TValue>(
		context.store,
		unmappedAtom,
		options,
	) as UseFieldResult<TValue, DefaultFormFieldResultFlags>;

	return {
		...result,
		...fieldResult,
	};

	function substateAtom<TState extends FieldStatePrimitive>(
		value: undefined | FieldStateOverride<PathValue<T, TPath>, TState>,
		state: FieldStateAtom<TState>,
	): FieldStateCallback<TState, PathValue<T, TPath>> {
		// These are tchnically giving back structured results, but that is _probably_ okay
		// FIXME: it would be nice make these types correct and not use `as`
		if (typeof value === 'function') {
			return value as FieldStateCallback<TState, PathValue<T, TPath>>;
		}
		return () =>
			value === undefined
				? (toFieldStateValue(
						walkFieldStateAtom(state, config.path as AnyPath),
				  ) as Atom<TState>)
				: atom(value as TState);
	}
}

function toFormSubset<T, TPath extends Path<T>, TValue>(
	config: FieldConfig<T, TPath, TValue>,
	options: FormResultContext<T>,
): UseFormResult<TValue> {
	const schema: ZodType<TValue> =
		config?.schema ??
		(getZodSchemaForPath(config.path, options.schema) as ZodType<TValue>);
	const unmappedAtom = options.atomFamily(config.path);
	const mapping = config.mapping as
		| undefined
		| FieldMapping<PathValue<T, TPath>, TValue>;
	const resultAtom = mapping
		? mapAtom<PathValue<T, TPath>, TValue>(
				unmappedAtom,
				mapping.toForm,
				mapping.fromForm,
		  )
		: (unmappedAtom as StandardWritableAtom<TValue>);
	const atomFamily = createPathAtomFamily(resultAtom);
	// options.atomFamily([...path, ...nextPath] as never) as never;
	const resultDefaultValue = getRefForPath(config, options.defaultValue);

	return buildFormResult<TValue>({
		pathPrefix: [...options.pathPrefix, ...(config.path as AnyPath)],
		translationPath: [
			...options.translationPath,
			...(config.translationPath ?? (config.path as AnyPath)),
		],
		store: options.store,
		atom: resultAtom,
		atomFamily,
		schema,
		formEvents: options.formEvents,
		errorStrategy: options.errorStrategy,
		formTranslation: options.formTranslation,
		defaultValue: resultDefaultValue,
		disabledFields: walkFieldStateAtom(
			options.disabledFields,
			config.path as AnyPath,
		),
		readOnlyFields: walkFieldStateAtom(
			options.readOnlyFields,
			config.path as AnyPath,
		),
	});
}

function toJsonPointer<T>(path: Path<T>): string;
function toJsonPointer(path: AnyPath): string;
function toJsonPointer(path: AnyPath) {
	return path
		.map((v) => `${v}`.replace('~', '~0').replace('/', '~1'))
		.join('/');
}

function createPathAtomFamily<T>(
	formAtom: StandardWritableAtom<T>,
): AtomFamily<T> {
	return createAtomFamily<Path<T>, StandardWritableAtom<unknown>>(
		(path) => getAtomForPath(path, formAtom) as StandardWritableAtom<unknown>,
		(a, b) => toJsonPointer(a) === toJsonPointer(b),
	) as AtomFamily<T>;
}

export function useForm<T>(options: FormOptions<T>): UseFormResult<T>;
export function useForm<T, const TFields extends FieldsConfig<T>>(
	options: FormOptions<T> & FormFieldsOptions<T, TFields>,
): UseFormResultWithFields<T, TFields>;
export function useForm<T>(
	options: FormOptions<T> & Partial<FormFieldsOptions<T, FieldsConfig<T>>>,
): UseFormResult<T> | UseFormResultWithFields<T, FieldsConfig<T>> {
	const store = useStore();
	return useMemo(
		(): UseFormResult<T> | UseFormResultWithFields<T, FieldsConfig<T>> => {
			const formEvents = new FormEvents();
			const strategy = errorsStrategy(
				options.preSubmit ?? 'onSubmit',
				options.postSubmit ?? 'onBlur',
				formEvents,
			);
			const formAtom = atom(options.defaultValue);
			const atomFamily = createPathAtomFamily(formAtom);

			const defaultValue = {
				get current(): T {
					return formAtom.init;
				},
				set current(value) {
					formAtom.init = value;
				},
			};

			const result = buildFormResult<T>({
				pathPrefix: [],
				translationPath: [],
				store,
				atom: formAtom,
				atomFamily,
				schema: options.schema,
				formEvents,
				errorStrategy: strategy,
				formTranslation: options.translation,
				defaultValue,
				disabledFields: toAtomFieldState(options.disabled ?? false),
				readOnlyFields: toAtomFieldState(options.readOnly ?? false),
			});

			if (!('fields' in options) || !options.fields) return result;

			const fields = buildFormFields(options.fields, result);

			return {
				...result,
				fields,
			};
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);
}

function getRefForPath<T, TPath extends Path<T>, TValue>(
	config: FieldConfig<T, TPath, TValue>,
	source: React.MutableRefObject<T>,
): React.MutableRefObject<TValue> {
	const mapping = config.mapping as FieldMapping<PathValue<T, TPath>, TValue>;
	const getPathValue = () =>
		getValueAtPath<T, TPath>(config.path)(source.current);

	const unmapped = {
		get current() {
			return getPathValue();
		},
		set current(value) {
			const patches: Patch[] = [
				{ op: 'replace', path: [...(config.path as AnyPath)], value },
			];
			applyPatches(getPathValue() as Objectish, patches);
		},
	};
	return mapping
		? {
				get current() {
					return mapping.toForm(unmapped.current);
				},
				set current(value) {
					const actualValue = mapping.fromForm(value);
					if (actualValue === noChange) return;
					const patches: Patch[] = [
						{
							op: 'replace',
							path: [...(config.path as AnyPath)],
							value: actualValue,
						},
					];
					applyPatches(getPathValue() as Objectish, patches);
				},
		  }
		: (unmapped as React.MutableRefObject<TValue>);
}

/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Atom, atom, useStore } from 'jotai';
import React, { MutableRefObject, useMemo } from 'react';
import { ZodError, ZodType, ZodTypeAny } from 'zod';
import { SetStateAction, StandardWritableAtom } from './StandardWritableAtom';
import { Path, PathValue } from './path';
import { applyPatches, produceWithPatches, Patch, Objectish } from 'immer';
import {
	FieldMapping,
	FieldOptions,
	UseFieldResult,
	UseFieldResultFlags,
	useFieldAtom,
} from './useField';
import { toInternalFieldAtom } from './toInternalFieldAtom';
import { createTriggeredErrorsAtom } from './createErrorsAtom';
import type { Loadable } from 'jotai/vanilla/utils/loadable';
import { AnyArray, isArray } from './arrays';
import {
	ErrorsStrategy,
	RegisterErrorStrategy,
	errorsStrategy,
} from './errorsStrategy';
import { FormEvents } from './events/FormEvents';
import { atomFamily as createAtomFamily } from 'jotai/utils';

export type UnmappedFieldConfig<
	T extends Objectish,
	TPath extends Path<T> = Path<T>,
> = {
	path: TPath;
	mapping?: FieldMapping<PathValue<T, TPath>, PathValue<T, TPath>>;
};
export type MappedFieldConfig<
	T extends Objectish,
	TPath extends Path<T> = Path<T>,
	TValue = PathValue<T, TPath>,
> = {
	path: TPath;
	mapping: FieldMapping<PathValue<T, TPath>, TValue>;
};

export type FieldConfig<T extends Objectish> =
	| Path<T>
	| UnmappedFieldConfig<T, Path<T>>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| MappedFieldConfig<T, Path<T>, any>;

export type FieldsConfig<T extends Objectish> = {
	[field: string]: FieldConfig<T> | ((...args: AnyArray) => FieldConfig<T>);
};

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
	T extends Objectish,
	// keeping the type param for future use
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	TFieldConfig extends FieldConfig<T>,
> = DefaultFormFieldResultFlags;
// example usage for how these flags work
// isCheckbox: TFieldConfig extends { readonly isCheckbox?: boolean }
// 	? IfTrueThenElse<TFieldConfig['isCheckbox'], true, false>
// 	: false;

export type FormFieldReturnType<
	T,
	TFlags extends UseFieldResultFlags = DefaultFormFieldResultFlags,
> = UseFieldResult<T, TFlags> &
	(T extends Objectish ? UseFormResult<T> : object);

export type FormFieldReturnTypeFromConfig<
	T extends Objectish,
	TFieldConfig extends FieldConfig<T>,
> = TFieldConfig extends Path<T>
	? FormFieldReturnType<
			PathValue<T, TFieldConfig>,
			FlagsForFormFieldConfig<T, TFieldConfig>
	  >
	: TFieldConfig extends MappedFieldConfig<T, infer TPath, infer TValue>
	? UseFieldResult<TValue, FlagsForFormFieldConfig<T, TFieldConfig>> &
			UseFormResult<PathValue<T, TPath>>
	: TFieldConfig extends UnmappedFieldConfig<T, infer TPath>
	? UseFieldResult<
			PathValue<T, TPath>,
			FlagsForFormFieldConfig<T, TFieldConfig>
	  > &
			UseFormResult<PathValue<T, TPath>>
	: never;

export type FormFields<T extends Objectish, TFields extends FieldsConfig<T>> = {
	[K in keyof TFields]: TFields[K] extends FieldConfig<T>
		? FormFieldReturnTypeFromConfig<T, TFields[K]>
		: TFields[K] extends (...args: infer TArgs) => infer TReturn
		? TReturn extends FieldConfig<T>
			? (...args: TArgs) => FormFieldReturnTypeFromConfig<T, TReturn>
			: never
		: never;
};

export type FormOptions<T extends Objectish> = {
	schema: ZodType<T>;
	defaultValue: T;
	translation: (field: string) => string;
	preSubmit?: ErrorsStrategy;
	postSubmit?: ErrorsStrategy;
};
export type FormFieldsOptions<
	T extends Objectish,
	TFields extends FieldsConfig<T>,
> = {
	fields: TFields;
};

export type AtomFamily<T extends Objectish> = <TPath extends Path<T>>(
	path: TPath,
) => StandardWritableAtom<PathValue<T, TPath>>;

export type UseFormResult<T extends Objectish> = {
	pathPrefix: Array<string | number | symbol>;
	store: ReturnType<typeof useStore>;
	atom: StandardWritableAtom<T>;
	atomFamily: AtomFamily<T>;
	schema: ZodType<T>;
	errors: Atom<Loadable<ZodError<T> | null>>;
	formEvents: FormEvents;
	defaultValue: React.MutableRefObject<T>;
	formTranslation: (field: string) => string;
	field<TPath extends Path<T>>(
		path: TPath,
	): FormFieldReturnTypeFromConfig<T, TPath>;
	updateAllErrors(this: void): void;

	get(this: void): T;
	set(this: void, value: T | ((prevValue: T) => T)): void;
	subset<TPath extends Path<T>>(
		this: void,
		path: TPath,
	): UseFormResult<PathValue<T, TPath>>;
	handleSubmit(
		this: void,
		callback: (value: T) => void | Promise<void>,
	): (ev?: React.SyntheticEvent<unknown>) => void;
	errorStrategy: RegisterErrorStrategy;
};

export type UseFieldsResult<
	T extends Objectish,
	TFields extends FieldsConfig<T> = Record<never, never>,
> = {
	fields: FormFields<T, TFields>;
};

type BuildFormResultOptions<T extends Objectish> = {
	pathPrefix: Array<string | number | symbol>;
	store: ReturnType<typeof useStore>;
	atom: StandardWritableAtom<T>;
	atomFamily: AtomFamily<T>;
	schema: ZodType<T>;
	formEvents: FormEvents;
	errorStrategy: RegisterErrorStrategy;
	formTranslation: (key: string) => string;
	defaultValue: MutableRefObject<T>;
};

function buildFormResult<T extends Objectish>({
	pathPrefix,
	store,
	atom,
	atomFamily,
	schema,
	formEvents,
	errorStrategy,
	formTranslation,
	defaultValue,
}: BuildFormResultOptions<T>): UseFormResult<T> {
	const [errors, trigger] = createTriggeredErrorsAtom(atom, schema);
	errorStrategy(formEvents, () => store.set(trigger));
	const subset = (path: Path<T>) =>
		toFormSubset(
			path,
			{
				pathPrefix,
				store,
				atom,
				atomFamily,
				schema,
				defaultValue,
				formTranslation,
			},
			formEvents,
			errorStrategy,
		);
	return {
		pathPrefix,
		defaultValue,
		store,
		atom,
		atomFamily,
		schema,
		errors,
		formEvents,
		field(path) {
			return toField({
				prefix: pathPrefix,
				config: path,
				schema,
				errorStrategy,
				formTranslation,
				store,
				family: atomFamily,
				subset,
				formEvents,
			});
		},
		updateAllErrors() {
			formEvents.dispatchEvent(FormEvents.UpdateAllErrors);
		},
		get: () => store.get(atom),
		set: (value: T) => store.set(atom, value),
		formTranslation,
		subset,
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
		errorStrategy,
	};
}

type BuildFormFieldsOptions<
	T extends Objectish,
	TFields extends FieldsConfig<T> = Record<never, never>,
> = {
	pathPrefix: Array<string | number | symbol>;
	fields: TFields;
	schema: ZodType<T>;
	errorStrategy: RegisterErrorStrategy;
	translation: (key: string) => string;
	store: ReturnType<typeof useStore>;
	family: AtomFamily<T>;
	subset: <TPath extends Path<T>>(
		this: void,
		path: TPath,
	) => UseFormResult<PathValue<T, TPath>>;
	formEvents: FormEvents;
};

function buildFormFields<
	T extends Objectish,
	TFields extends FieldsConfig<T> = Record<never, never>,
>({
	pathPrefix,
	fields,
	schema,
	errorStrategy,
	translation,
	store,
	family,
	subset,
	formEvents,
}: BuildFormFieldsOptions<T, TFields>) {
	const params = {
		prefix: pathPrefix,
		schema,
		errorStrategy,
		formTranslation: translation,
		store,
		family,
		subset,
		formEvents,
	};
	return Object.fromEntries(
		Object.entries(fields).map(([field, config]) => {
			return [
				field,
				typeof config === 'function'
					? (...args: AnyArray) =>
							toField<T, FieldConfig<T>>({ config: config(args), ...params })
					: toField({ config, ...params }),
			];
		}),
	) as FormFields<T, TFields>;
}

type ToFieldOptions<T extends Objectish, TField extends FieldConfig<T>> = {
	prefix: Array<string | number | symbol>;
	config: TField;
	schema: ZodType<T>;
	errorStrategy: RegisterErrorStrategy;
	formTranslation: (key: string) => string;
	store: ReturnType<typeof useStore>;
	family: AtomFamily<T>;
	subset: <TPath extends Path<T>>(
		this: void,
		path: TPath,
	) => UseFormResult<PathValue<T, TPath>>;
	formEvents: FormEvents;
};

function toField<T extends Objectish, TField extends FieldConfig<T>>({
	prefix,
	config,
	schema,
	errorStrategy,
	formTranslation,
	store,
	family,
	subset,
	formEvents,
}: ToFieldOptions<T, TField>): FormFieldReturnTypeFromConfig<T, TField> {
	const path = (isArray(config) ? config : config.path) as Path<T>;
	const options: Partial<FieldOptions<T, unknown>> = {
		schema: getZodSchemaForPath(path, schema) as ZodTypeAny,
		errorStrategy,
		formEvents,
		translation: (part) =>
			formTranslation(
				[
					'fields',
					...prefix,
					...path,
					...(typeof part === 'string' ? [part] : part),
				].join('.'),
			),
	};
	if (!isArray(config) && 'mapping' in config) options.mapping = config.mapping;
	const result = subset(path);
	return {
		...result,
		...(toInternalFieldAtom(
			store,
			family(path),
			options as never,
		) as FormFieldReturnTypeFromConfig<T, TField>),
	};
}

function toJsonPointer(path: ReadonlyArray<string | number>) {
	return path.map((v) => `${v}`.replace('~', '~0').replace('/', '~1'));
}

export function useForm<T extends Objectish>(
	options: FormOptions<T>,
): UseFormResult<T>;
export function useForm<
	T extends Objectish,
	const TFields extends FieldsConfig<T>,
>(
	options: FormOptions<T> & FormFieldsOptions<T, TFields>,
): UseFormResult<T> & UseFieldsResult<T, TFields>;
export function useForm<T extends Objectish>(
	options: FormOptions<T> & Partial<FormFieldsOptions<T, FieldsConfig<T>>>,
): UseFormResult<T> & Partial<UseFieldsResult<T, FieldsConfig<T>>> {
	const store = useStore();
	return useMemo(
		() => {
			const formEvents = new FormEvents();
			const strategy = errorsStrategy(
				options.preSubmit ?? 'onSubmit',
				options.postSubmit ?? 'onBlur',
				formEvents,
			);
			const formAtom = atom(options.defaultValue);
			const atomFamily = createAtomFamily<
				Path<T>,
				StandardWritableAtom<unknown>
			>(
				(path) =>
					getAtomForPath(path, formAtom) as StandardWritableAtom<unknown>,
				(a, b) => toJsonPointer(a) === toJsonPointer(b),
			) as AtomFamily<T>;

			const result = buildFormResult<T>({
				pathPrefix: [],
				store,
				atom: formAtom,
				atomFamily,
				schema: options.schema,
				formEvents,
				errorStrategy: strategy,
				formTranslation: options.translation,
				defaultValue: {
					get current(): T {
						return formAtom.init;
					},
					set current(value) {
						formAtom.init = value;
					},
				},
			});

			if (!options.fields) return result;

			const fields = buildFormFields<T, FieldsConfig<T>>({
				pathPrefix: [],
				fields: options.fields,
				schema: result.schema,
				errorStrategy: result.errorStrategy,
				translation: options.translation,
				store,
				family: atomFamily,
				subset: result.subset,
				formEvents,
			});

			return {
				...result,
				fields,
			};
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);
}

export function useFormFields<
	T extends Objectish,
	const TFields extends FieldsConfig<T>,
>(
	form: UseFormResult<T>,
	fields: TFields,
): UseFieldsResult<T, TFields>['fields'] {
	const store = useStore();
	return useMemo(
		() =>
			buildFormFields<T, TFields>({
				pathPrefix: form.pathPrefix,
				fields,
				schema: form.schema,
				errorStrategy: form.errorStrategy,
				translation: form.formTranslation,
				store,
				family: form.atomFamily,
				subset: form.subset,
				formEvents: form.formEvents,
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);
}

function getZodSchemaForPath<T, TPath extends Path<T>>(
	steps: TPath,
	schema: ZodType<T>,
): ZodType<PathValue<T, TPath>> {
	return (steps as ReadonlyArray<string | number>).reduce(
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		(prev, next) => doStep(next, prev),
		schema,
	) as ZodType<PathValue<T, TPath>>;

	function doStep(step: string | number, current: ZodTypeAny): ZodTypeAny {
		if ('shape' in current) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			return (current.shape as never)[step] ?? current._def.catchall;
		} else if ('element' in current) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
			return (current as any).element;
		} else {
			console.error('during', { steps, schema }, 'unable to continue at', {
				step,
				current,
			});
			throw new Error('Unable to walk zod path; see console');
		}
	}
}

function getAtomForPath<T extends Objectish, TPath extends Path<T>>(
	steps: TPath,
	source: StandardWritableAtom<T>,
) {
	type TOut = PathValue<T, TPath>;

	const getPathValue = (input: T) =>
		(steps as ReadonlyArray<string | number>).reduce(
			(prev, next) => (prev as never)[next],
			input as unknown,
		) as PathValue<T, TPath>;
	const resultAtom = atom(
		(get): PathValue<T, TPath> => getPathValue(get(source)),
		(_get, set, effect: TOut | SetStateAction<TOut>) =>
			set(source, (prev) => {
				// 'val' is added and removed here to handle `undefined` returns.
				// If `undefined` is returned, immer assumes the Draft (`d`) is
				// modified, losing track of the `undefined`. This necessitates
				// the `.slice(1)` below.
				const patches: Patch[] =
					typeof effect === 'function'
						? produceWithPatches<{ val: PathValue<T, TPath> }>(
								{ val: getPathValue(prev) },
								(d) => {
									d.val = (effect as SetStateAction<TOut>)(
										d.val as TOut,
									) as never;
								},
						  )[1]
						: [{ op: 'replace', path: [], value: effect }];
				const finalPatches = patches.map(
					(patch): Patch => ({
						...patch,
						path: [...steps, ...patch.path.slice(1)],
					}),
				);
				return applyPatches(prev, finalPatches);
			}),
	);
	return resultAtom;
}

function getRefForPath<T extends Objectish, TPath extends Path<T>>(
	steps: TPath,
	source: React.MutableRefObject<T>,
): React.MutableRefObject<PathValue<T, TPath>> {
	const getPathValue = () =>
		(steps as ReadonlyArray<string | number>).reduce(
			(prev, next) => (prev as never)[next],
			source.current as unknown,
		) as PathValue<T, TPath>;
	return {
		get current() {
			return getPathValue();
		},
		set current(value) {
			const patches: Patch[] = [{ op: 'replace', path: [...steps], value }];
			applyPatches(getPathValue(), patches);
		},
	};
}

function toFormSubset<T extends Objectish, TPath extends Path<T>>(
	steps: TPath,
	options: Pick<
		UseFormResult<T>,
		| 'pathPrefix'
		| 'store'
		| 'atom'
		| 'atomFamily'
		| 'schema'
		| 'defaultValue'
		| 'formTranslation'
	>,
	formEvents: FormEvents,
	errorStrategy: RegisterErrorStrategy,
): UseFormResult<PathValue<T, TPath>> {
	const schema = getZodSchemaForPath(steps, options.schema);
	const resultAtom = getAtomForPath(steps, options.atom);
	const atomFamily: AtomFamily<PathValue<T, TPath>> = (path) =>
		options.atomFamily([...steps, ...path] as never) as never;
	const resultDefaultValue = getRefForPath(steps, options.defaultValue);

	return buildFormResult({
		pathPrefix: [...options.pathPrefix, ...steps],
		store: options.store,
		atom: resultAtom,
		atomFamily,
		schema,
		formEvents,
		errorStrategy,
		formTranslation: options.formTranslation,
		defaultValue: resultDefaultValue,
	});
}

export function useFormField<T extends Objectish, TPath extends Path<T>>(
	steps: TPath,
	options: UseFormResult<T>,
) {
	return useFieldAtom(options.atomFamily(steps), {
		schema: getZodSchemaForPath(steps, options.schema),
	});
}

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
import { IfTrueThenElse } from './type-helpers';
import { atomFamily as createAtomFamily } from 'jotai/utils';

export type UnmappedFieldConfig<
	T extends Objectish,
	TPath extends Path<T> = Path<T>,
> = {
	path: TPath;
	isCheckbox?: boolean;
	mapping?: FieldMapping<PathValue<T, TPath>, PathValue<T, TPath>>;
};
export type MappedFieldConfig<
	T extends Objectish,
	TPath extends Path<T> = Path<T>,
	TValue = PathValue<T, TPath>,
> = {
	path: TPath;
	isCheckbox?: boolean;
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
	T extends Objectish,
	TPath extends Path<T>,
	TValue,
	TArgs extends null | AnyArray,
	TFlags extends UseFieldResultFlags,
> = TArgs extends AnyArray
	? (...args: TArgs) => UseFieldResult<PathValue<T, TPath>, TValue, TFlags>
	: UseFieldResult<PathValue<T, TPath>, TValue, TFlags>;

type FlagsForFormFieldConfig<
	T extends Objectish,
	TFieldConfig extends FieldConfig<T>,
> = {
	hasErrors: true;
	isCheckbox: TFieldConfig extends { readonly isCheckbox?: boolean }
		? IfTrueThenElse<TFieldConfig['isCheckbox'], true, false>
		: false;
	hasTranslations: true;
};

type FormFieldReturnType<
	T extends Objectish,
	TFieldConfig extends FieldConfig<T>,
> = TFieldConfig extends Path<T>
	? UseFieldResult<
			PathValue<T, TFieldConfig>,
			PathValue<T, TFieldConfig>,
			FlagsForFormFieldConfig<T, TFieldConfig>
	  >
	: TFieldConfig extends MappedFieldConfig<T, infer TPath, infer TValue>
	? UseFieldResult<
			PathValue<T, TPath>,
			TValue,
			FlagsForFormFieldConfig<T, TFieldConfig>
	  >
	: TFieldConfig extends UnmappedFieldConfig<T, infer TPath>
	? UseFieldResult<
			PathValue<T, TPath>,
			PathValue<T, TPath>,
			FlagsForFormFieldConfig<T, TFieldConfig>
	  >
	: never;

export type FormFields<T extends Objectish, TFields extends FieldsConfig<T>> = {
	[K in keyof TFields]: TFields[K] extends FieldConfig<T>
		? FormFieldReturnType<T, TFields[K]>
		: TFields[K] extends (...args: infer TArgs) => infer TReturn
		? TReturn extends FieldConfig<T>
			? (...args: TArgs) => FormFieldReturnType<T, TReturn>
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
	store: ReturnType<typeof useStore>;
	atom: StandardWritableAtom<T>;
	atomFamily: AtomFamily<T>;
	schema: ZodType<T>;
	errors: Atom<Loadable<ZodError<T> | null>>;
	formEvents: FormEvents;
	defaultValue: React.MutableRefObject<T>;
	translation: (field: string) => string;

	get(this: void): T;
	set(this: void, value: T | ((prevValue: T) => T)): void;
	subset<TPath extends Path<T>>(
		this: void,
		path: TPath,
	): UseFormResult<PathValue<T, TPath>>;
	handleSubmit(
		this: void,
		callback: (value: T) => void | Promise<void>,
	): React.ReactEventHandler;
	errorStrategy: RegisterErrorStrategy;
};

export type UseFieldsResult<
	T extends Objectish,
	TFields extends FieldsConfig<T> = Record<never, never>,
> = {
	fields: FormFields<T, TFields>;
};

function buildFormResult<T extends Objectish>(
	store: ReturnType<typeof useStore>,
	atom: StandardWritableAtom<T>,
	atomFamily: AtomFamily<T>,
	schema: ZodType<T>,
	formEvents: FormEvents,
	errorStrategy: RegisterErrorStrategy,
	translation: (key: string) => string,
	defaultValue: MutableRefObject<T>,
): UseFormResult<T> {
	const [errors, trigger] = createTriggeredErrorsAtom(atom, schema);
	errorStrategy(formEvents, () => store.set(trigger));
	return {
		defaultValue,
		store,
		atom,
		atomFamily,
		schema,
		errors,
		formEvents,
		get: () => store.get(atom),
		set: (value: T) => store.set(atom, value),
		translation,
		subset: (path) =>
			toFormSubset(
				path,
				{ store, atom, atomFamily, schema, defaultValue, translation },
				formEvents,
				errorStrategy,
			),
		handleSubmit: (callback) => async (event) => {
			formEvents.dispatchEvent(FormEvents.Submit);
			event.preventDefault();
			const data = store.get(atom);
			const errorsResult = await schema.safeParseAsync(data);
			if (!errorsResult.success) {
				return;
			}
			await callback(errorsResult.data);
		},
		errorStrategy,
		// TODO: allow manual trigger to display errors
	};
}

function buildFormFields<
	T extends Objectish,
	TFields extends FieldsConfig<T> = Record<never, never>,
>(
	fields: TFields,
	schema: ZodType<T>,
	errorStrategy: RegisterErrorStrategy,
	translation: (key: string) => string,
	store: ReturnType<typeof useStore>,
	family: AtomFamily<T>,
) {
	return Object.fromEntries(
		Object.entries(fields).map(([field, config]) => {
			return [
				field,
				typeof config === 'function'
					? (...args: AnyArray) =>
							toField(
								config(args),
								schema,
								errorStrategy,
								translation,
								store,
								family,
							)
					: toField(config, schema, errorStrategy, translation, store, family),
			];
		}),
	) as FormFields<T, TFields>;
}

function toField<T extends Objectish, TField extends FieldConfig<T>>(
	config: TField,
	schema: ZodType<T>,
	errorStrategy: RegisterErrorStrategy,
	translation: (key: string) => string,
	store: ReturnType<typeof useStore>,
	family: AtomFamily<T>,
): FormFieldReturnType<T, TField> {
	const path = (isArray(config) ? config : config.path) as Path<T>;
	const options: Partial<FieldOptions<T, unknown>> = {
		schema: getZodSchemaForPath(path, schema) as ZodTypeAny,
		errorStrategy,
		translation: (part) => translation(['fields', ...path, ...part].join('.')),
	};
	if (!isArray(config) && 'mapping' in config) options.mapping = config.mapping;
	if ('isCheckbox' in config) options.isCheckbox = config.isCheckbox;
	return toInternalFieldAtom(
		store,
		family(path),
		options as never,
	) as FormFieldReturnType<T, TField>;
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

			const result = buildFormResult<T>(
				store,
				formAtom,
				atomFamily,
				options.schema,
				formEvents,
				strategy,
				options.translation,
				{
					get current(): T {
						return formAtom.init;
					},
					set current(value) {
						formAtom.init = value;
					},
				},
			);

			if (!options.fields) return result;

			const fields = buildFormFields<T, FieldsConfig<T>>(
				options.fields,
				result.schema,
				result.errorStrategy,
				options.translation,
				store,
				atomFamily,
			);

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
			buildFormFields<T, TFields>(
				fields,
				form.schema,
				form.errorStrategy,
				form.translation,
				store,
				form.atomFamily,
			),
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
		'store' | 'atom' | 'atomFamily' | 'schema' | 'defaultValue' | 'translation'
	>,
	formEvents: FormEvents,
	errorStrategy: RegisterErrorStrategy,
): UseFormResult<PathValue<T, TPath>> {
	const schema = getZodSchemaForPath(steps, options.schema);
	const resultAtom = getAtomForPath(steps, options.atom);
	const atomFamily: AtomFamily<PathValue<T, TPath>> = (path) =>
		options.atomFamily([...steps, ...path] as never) as never;
	const resultDefaultValue = getRefForPath(steps, options.defaultValue);

	return buildFormResult(
		options.store,
		resultAtom,
		atomFamily,
		schema,
		formEvents,
		errorStrategy,
		options.translation,
		resultDefaultValue,
	);
}

export function useFormField<T extends Objectish, TPath extends Path<T>>(
	steps: TPath,
	options: UseFormResult<T>,
) {
	return useFieldAtom(options.atomFamily(steps), {
		schema: getZodSchemaForPath(steps, options.schema),
	});
}

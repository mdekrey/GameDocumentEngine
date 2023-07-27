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
import { Loadable } from 'node_modules/jotai/vanilla/utils/loadable';
import { AnyArray, isArray } from './arrays';
import {
	ErrorsStrategy,
	RegisterErrorStrategy,
	errorsStrategy,
} from './errorsStrategy';
import { FormEvents } from './events/FormEvents';
import { IfTrueThenElse } from './type-helpers';

type UnmappedFieldConfig<
	T extends Objectish,
	TPath extends Path<T> = Path<T>,
> = {
	path: TPath;
	isCheckbox?: boolean;
	mapping?: FieldMapping<PathValue<T, TPath>, PathValue<T, TPath>>;
};
type MappedFieldConfig<
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
};

type FormFieldReturnType<
	T extends Objectish,
	TFieldConfig extends FieldConfig<T>,
> = TFieldConfig extends Path<T>
	? ConfiguredFormField<
			T,
			TFieldConfig,
			PathValue<T, TFieldConfig>,
			null,
			FlagsForFormFieldConfig<T, TFieldConfig>
	  >
	: TFieldConfig extends UnmappedFieldConfig<T, infer TPath>
	? ConfiguredFormField<
			T,
			TPath,
			PathValue<T, TPath>,
			null,
			FlagsForFormFieldConfig<T, TFieldConfig>
	  >
	: TFieldConfig extends MappedFieldConfig<T, infer TPath, infer TValue>
	? ConfiguredFormField<
			T,
			TPath,
			TValue,
			null,
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

export type FormOptions<
	T extends Objectish,
	TFields extends FieldsConfig<T> = Record<never, never>,
> = {
	schema: ZodType<T>;
	defaultValue: T;
	preSubmit?: ErrorsStrategy;
	postSubmit?: ErrorsStrategy;
	fields?: TFields;
} & (TFields extends Record<never, never> ? object : { fields: TFields });

export type UseFormResult<
	T extends Objectish,
	TFields extends FieldsConfig<T> = Record<never, never>,
> = {
	store: ReturnType<typeof useStore>;
	atom: StandardWritableAtom<T>;
	schema: ZodType<T>;
	errors: Atom<Loadable<ZodError<T> | null>>;
	fields: FormFields<T, TFields>;
	formEvents: FormEvents;
	defaultValue: React.MutableRefObject<T>;

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

function buildFormResult<
	T extends Objectish,
	TFields extends FieldsConfig<T> = Record<never, never>,
>(
	store: ReturnType<typeof useStore>,
	atom: StandardWritableAtom<T>,
	schema: ZodType<T>,
	fields: TFields,
	formEvents: FormEvents,
	errorStrategy: RegisterErrorStrategy,
	defaultValue: MutableRefObject<T>,
): UseFormResult<T, TFields> {
	const [errors, trigger] = createTriggeredErrorsAtom(atom, schema);
	errorStrategy(formEvents, () => store.set(trigger));
	const fieldsResult = Object.fromEntries(
		Object.entries(fields).map(([field, config]) => {
			return [
				field,
				typeof config === 'function'
					? (...args: AnyArray) => toField(config(args))
					: toField(config),
			];

			function toField(
				config: FieldConfig<T>,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			): UseFieldResult<unknown, unknown, any> {
				const path = (isArray(config) ? config : config.path) as Path<T>;
				const options: Partial<FieldOptions<T, unknown>> = {
					schema: getZodSchemaForPath(path, schema) as ZodTypeAny,
					errorStrategy,
				};
				if (!isArray(config) && 'mapping' in config)
					options.mapping = config.mapping;
				if ('isCheckbox' in config) options.isCheckbox = config.isCheckbox;
				return toInternalFieldAtom(
					store,
					getAtomForPath(path, atom),
					options as never,
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
				) as UseFieldResult<unknown, unknown, any>;
			}
		}),
	) as FormFields<T, TFields>;
	return {
		defaultValue,
		store,
		atom,
		schema,
		errors,
		fields: fieldsResult,
		formEvents,
		get: () => store.get(atom),
		set: (value: T) => store.set(atom, value),
		subset: (path) =>
			toFormSubset(
				path,
				{ store, atom, schema, defaultValue },
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

export function useForm<
	T extends Objectish,
	const TFields extends FieldsConfig<T> = Record<never, never>,
>(options: FormOptions<T, TFields>): UseFormResult<T, TFields> {
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
			return buildFormResult<T, TFields>(
				store,
				formAtom,
				options.schema,
				options.fields ?? ({} as unknown as TFields),
				formEvents,
				strategy,
				{
					get current(): T {
						return formAtom.init;
					},
					set current(value) {
						formAtom.init = value;
					},
				},
			);
		},
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
				const patches: Patch[] =
					typeof effect === 'function'
						? produceWithPatches<PathValue<T, TPath>>(getPathValue(prev), (d) =>
								(effect as SetStateAction<TOut>)(d as TOut),
						  )[1]
						: [{ op: 'replace', path: [], value: effect }];
				const finalPatches = patches.map(
					(patch): Patch => ({ ...patch, path: [...steps, ...patch.path] }),
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
	options: Pick<UseFormResult<T>, 'store' | 'atom' | 'schema' | 'defaultValue'>,
	formEvents: FormEvents,
	errorStrategy: RegisterErrorStrategy,
): UseFormResult<PathValue<T, TPath>> {
	const schema = getZodSchemaForPath(steps, options.schema);
	const resultAtom = getAtomForPath(steps, options.atom);
	const resultDefaultValue = getRefForPath(steps, options.defaultValue);

	return buildFormResult(
		options.store,
		resultAtom,
		schema,
		{},
		formEvents,
		errorStrategy,
		resultDefaultValue,
	);
}

export function useFormField<T extends Objectish, TPath extends Path<T>>(
	steps: TPath,
	options: UseFormResult<T>,
) {
	const fieldAtomMemo = useMemo(
		() => getAtomForPath(steps, options.atom),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[...steps, options.atom],
	);

	return useFieldAtom(fieldAtomMemo, {
		schema: getZodSchemaForPath(steps, options.schema),
	});
}

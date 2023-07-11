/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Atom, atom, useStore } from 'jotai';
import { useMemo } from 'react';
import { ZodError, ZodType, ZodTypeAny } from 'zod';
import { SetStateAction, StandardWritableAtom } from './StandardWritableAtom';
import { Path, PathValue } from './path';
import { applyPatches, produceWithPatches, Patch, Objectish } from 'immer';
import {
	FieldMapping,
	FieldOptions,
	UseFieldResult,
	createErrorsAtom,
	toInternalFieldAtom,
	useFieldAtom,
} from './useField';
import { Loadable } from 'node_modules/jotai/vanilla/utils/loadable';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyArgs = any[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isArray(array: any): array is readonly any[] {
	return Array.isArray(array);
}

type UnmappedFieldConfig<
	T extends Objectish,
	TPath extends Path<T> = Path<T>,
> = {
	path: TPath;
	mapping?: FieldMapping<PathValue<T, TPath>, PathValue<T, TPath>>;
};
type MappedFieldConfig<
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
	[field: string]: FieldConfig<T> | ((...args: AnyArgs) => FieldConfig<T>);
};

export type ConfiguredFormField<
	T extends Objectish,
	TPath extends Path<T> = Path<T>,
	TValue = PathValue<T, TPath>,
	TArgs extends null | AnyArgs = null,
> = TArgs extends AnyArgs
	? (...args: TArgs) => UseFieldResult<PathValue<T, TPath>, TValue>
	: UseFieldResult<PathValue<T, TPath>, TValue>;

type FormFieldReturnType<
	T extends Objectish,
	TFieldConfig extends FieldConfig<T>,
> = TFieldConfig extends Path<T>
	? ConfiguredFormField<T, TFieldConfig, PathValue<T, TFieldConfig>, null>
	: TFieldConfig extends UnmappedFieldConfig<T, infer TPath>
	? ConfiguredFormField<T, TPath, PathValue<T, TPath>, null>
	: TFieldConfig extends MappedFieldConfig<T, infer TPath, infer TValue>
	? ConfiguredFormField<T, TPath, TValue, null>
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
	get(this: void): T;
	subset<TPath extends Path<T>>(
		this: void,
		path: TPath,
	): UseFormResult<PathValue<T, TPath>>;
	fields: FormFields<T, TFields>;
};

function buildFormResult<
	T extends Objectish,
	TFields extends FieldsConfig<T> = Record<never, never>,
>(
	store: ReturnType<typeof useStore>,
	atom: StandardWritableAtom<T>,
	schema: ZodType<T>,
	fields: TFields,
): UseFormResult<T, TFields> {
	const errorsAtom = createErrorsAtom(atom, schema);
	return {
		store,
		atom,
		schema,
		errors: errorsAtom,
		get: () => store.get(atom),
		subset: (path) => toFormSubset(path, { store, atom, schema }),
		fields: Object.fromEntries(
			Object.entries(fields).map(([field, config]) => {
				return [
					field,
					typeof config === 'function'
						? (...args: AnyArgs) => toField(config(args))
						: toField(config),
				];

				function toField(config: FieldConfig<T>): UseFieldResult<unknown> {
					const path = (isArray(config) ? config : config.path) as Path<T>;
					const options: Partial<FieldOptions<T, unknown>> = {
						schema: getZodSchemaForPath(path, schema) as ZodTypeAny,
					};
					if (!isArray(config) && 'mapping' in config)
						options.mapping = config.mapping;
					return toInternalFieldAtom(
						store,
						getAtomForPath(path, atom),
						options as never,
					) as UseFieldResult<unknown>;
				}
			}),
		) as FormFields<T, TFields>,
	};
}

export function useForm<
	T extends Objectish,
	TFields extends FieldsConfig<T> = Record<never, never>,
>(options: FormOptions<T, TFields>): UseFormResult<T, TFields> {
	const store = useStore();
	return useMemo(
		() => {
			const formAtom = atom(options.defaultValue);
			return buildFormResult<T, TFields>(
				store,
				formAtom,
				options.schema,
				options.fields ?? ({} as unknown as TFields),
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
			return (current.shape as never)[step];
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

function toFormSubset<T extends Objectish, TPath extends Path<T>>(
	steps: TPath,
	options: Pick<UseFormResult<T>, 'store' | 'atom' | 'schema'>,
): UseFormResult<PathValue<T, TPath>> {
	const schema = getZodSchemaForPath(steps, options.schema);
	const resultAtom = getAtomForPath(steps, options.atom);

	return buildFormResult(options.store, resultAtom, schema, {});
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

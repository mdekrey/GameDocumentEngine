import type { AnyArray } from './arrays';
import { isArray } from './arrays';
import type { ZodType } from 'zod';
import type { AnyPath, Path, PathValue } from './path';
import type { FieldMapping, FieldStateContext } from './useField';
import type { FieldStatePrimitive, PerFieldState } from './fieldStateTracking';
import type { Atom, Getter } from 'jotai';
import type { IfAny } from './type-helpers';

export type UnmappedFieldConfig<T, TPath extends Path<T> = Path<T>> = {
	path: TPath;
	mapping?: undefined;
};
export type MappedFieldConfig<
	T,
	TPath extends Path<T> = Path<T>,
	TValue = PathValue<T, TPath>,
> = {
	path: TPath;
	mapping: FieldMapping<PathValue<T, TPath>, TValue>;
};

export type UntypedFieldConfigObject<TValue> = {
	path: AnyPath;
	schema?: ZodType<TValue>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	mapping?: FieldMapping<any, TValue>;
};

export type FormFieldStateContext<TFormValue, TOriginalValue, TDerivedValue> = {
	value: Atom<TFormValue>;
} & FieldStateContext<TOriginalValue, TDerivedValue>;

export type FormFieldStateCallback<
	T,
	TFormValue,
	TOriginalValue,
	TDerivedValue,
> = (
	context: FormFieldStateContext<TFormValue, TOriginalValue, TDerivedValue>,
	getter: Getter,
) => Atom<T>;

export type FormFieldStateContextAtom<
	T,
	TFormValue,
	TOriginalValue,
	TDerivedValue,
> = (
	context: FormFieldStateContext<TFormValue, TOriginalValue, TDerivedValue>,
	getter: Getter,
) => T;

export type FieldStateOverride<
	TFormValue,
	TOriginalValue,
	TDerivedValue,
	TState extends FieldStatePrimitive,
> =
	| PerFieldState<TState>
	| import('jotai').Atom<PerFieldState<TState>>
	| FormFieldStateContextAtom<
			PerFieldState<TState>,
			TFormValue,
			TOriginalValue,
			TDerivedValue
	  >;

export type FieldConfig<
	T,
	TPath extends Path<T> = Path<T>,
	TValue = PathValue<T, TPath>,
> = {
	path: TPath;
	schema?: ZodType<TValue>;
	translationPath?: AnyPath;
	disabled?: FieldStateOverride<T, PathValue<T, TPath>, TValue, boolean>;
	readOnly?: FieldStateOverride<T, PathValue<T, TPath>, TValue, boolean>;
} & IfAny<
	TValue,
	Partial<MappedFieldConfig<T, TPath, any>>,
	[PathValue<T, TPath>] extends [TValue]
		? {
				mapping?: (
					| UnmappedFieldConfig<T, TPath>
					| MappedFieldConfig<T, TPath>
				)['mapping'];
		  }
		: {
				mapping: MappedFieldConfig<T, TPath, TValue>['mapping'];
		  }
>;

/** To be used with InferredFieldConfig to defer enforcing type assignment */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFieldConfig<T> = FieldConfig<T, Path<T>, any>;
export type BaseAnyFieldConfig<T> = Path<T> | AnyFieldConfig<T>;

export type InferredFieldConfig<
	T,
	TConfig extends BaseAnyFieldConfig<T>,
> = TConfig extends FieldConfig<T, infer TPath, infer TValue>
	? FieldConfig<T, TPath, TValue>
	: /*TConfig extends FieldConfig<T, infer TPath, any>
	? TPath extends Path<T>
		? // eslint-disable-next-line @typescript-eslint/no-explicit-any
		  TConfig extends { mapping?: undefined }
			? FieldConfig<T, TPath, PathValue<T, TPath>>
			: TConfig extends { mapping: FieldMapping<PathValue<T, TPath>, any> }
			? TConfig extends MappedFieldConfig<T, TPath, infer TValue>
				? FieldConfig<T, TPath, TValue>
				: FieldConfig<T, TPath, PathValue<T, TPath>>
			: {
					path: {
						ERROR: `Mapping is not valid for type`;
						expectedType: PathValue<T, TPath>;
					} & BaseAnyFieldConfig<T>;
			  }
		: {
				path: {
					ERROR: `Path is not valid for type`;
					validPaths: Path<T>;
				} & BaseAnyFieldConfig<T>;
		  }*/
	  Path<T>;

export type InferredFieldConfigParams<
	T,
	TConfig extends BaseAnyFieldConfig<T>,
> = TConfig extends { path: infer TPath }
	? TPath extends Path<T>
		? TConfig extends MappedFieldConfig<T, TPath, infer TValue>
			? [T, TPath, TValue]
			: TConfig extends UnmappedFieldConfig<T, infer TPath>
			? [T, TPath, PathValue<T, TPath>]
			: { error: 'Invalid mapping' }
		: never
	: TConfig extends Path<T>
	? [T, TConfig, PathValue<T, TConfig>]
	: never;

export type InferredFieldConfigObject<
	T,
	TConfig extends BaseAnyFieldConfig<T>,
> = InferredFieldConfigParams<T, TConfig> extends [T, infer TPath, infer TValue]
	? TPath extends Path<T>
		? FieldConfig<T, TPath, TValue>
		: never
	: never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldConfigOrPath<T, TFieldType = any> =
	| Path<T>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| FieldConfig<T, any, TFieldType>;

export type FieldsConfig<T> = {
	[field: string]:
		| FieldConfigOrPath<T>
		| ((...args: AnyArray) => FieldConfigOrPath<T>);
};

export type FieldConfigToType<
	T,
	TFieldConfig extends BaseAnyFieldConfig<T>,
> = TFieldConfig extends Path<T>
	? PathValue<T, TFieldConfig>
	: TFieldConfig extends MappedFieldConfig<T, Path<T>, infer TValue>
	? TValue
	: TFieldConfig extends UnmappedFieldConfig<T, infer TPath>
	? PathValue<T, TPath>
	: never;

export function toConfigObject<T, TFieldConfig extends BaseAnyFieldConfig<T>>(
	config: TFieldConfig & InferredFieldConfig<T, TFieldConfig>,
): InferredFieldConfigObject<T, TFieldConfig>;
export function toConfigObject<
	T,
	TValue,
	TFieldConfig extends FieldConfigOrPath<T, TValue>,
>(config: TFieldConfig): UntypedFieldConfigObject<TValue>;
export function toConfigObject<TValue>(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	config: FieldConfigOrPath<any, TValue>,
): UntypedFieldConfigObject<TValue> {
	if (isArray(config)) {
		return {
			path: config,
		};
	}
	return config;
}

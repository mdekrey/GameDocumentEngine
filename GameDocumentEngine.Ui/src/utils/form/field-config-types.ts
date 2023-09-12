import type { AnyArray } from './arrays';
import { isArray } from './arrays';
import type { ZodType } from 'zod';
import type { AnyPath, Path, PathValue } from './path';
import type { FieldMapping } from './useField';

export type UnmappedFieldConfig<T, TPath extends Path<T> = Path<T>> = {
	path: TPath;
	mapping?: FieldMapping<PathValue<T, TPath>, PathValue<T, TPath>>;
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

export type TypedFieldConfigObject<
	T,
	TPath extends Path<T> = Path<T>,
	TValue = PathValue<T, TPath>,
> = {
	path: TPath;
	schema?: ZodType<TValue>;
	translationPath?: AnyPath;
	disabled?: boolean;
	readOnly?: boolean;
} & ([PathValue<T, TPath>] extends [TValue]
	? {
			mapping?: FieldMapping<PathValue<T, TPath>, PathValue<T, TPath>>;
	  }
	: {
			mapping: FieldMapping<PathValue<T, TPath>, TValue>;
	  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldConfig<T, TFieldType = any> =
	| Path<T>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| TypedFieldConfigObject<T, any, TFieldType>;

export type FieldsConfig<T> = {
	[field: string]: FieldConfig<T> | ((...args: AnyArray) => FieldConfig<T>);
};

export type FieldConfigToType<
	T,
	TFieldConfig extends FieldConfig<T>,
> = TFieldConfig extends Path<T>
	? PathValue<T, TFieldConfig>
	: TFieldConfig extends MappedFieldConfig<T, Path<T>, infer TValue>
	? TValue
	: TFieldConfig extends UnmappedFieldConfig<T, infer TPath>
	? PathValue<T, TPath>
	: never;

export function toConfigObject<
	T,
	TValue,
	TFieldConfig extends FieldConfig<T, TValue>,
>(config: TFieldConfig): UntypedFieldConfigObject<TValue>;
export function toConfigObject<TValue>(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	config: FieldConfig<any, TValue>,
): UntypedFieldConfigObject<TValue> {
	if (isArray(config)) {
		return {
			path: config,
		};
	}
	return config;
}

import type { Atom, PrimitiveAtom } from 'jotai';
import { atom, useStore } from 'jotai';
import { useMemo } from 'react';
import type { ZodType } from 'zod';
import type { StandardWritableAtom } from './internals/StandardWritableAtom';
import { toInternalFieldAtom } from './internals/toInternalFieldAtom';
import { useConstant } from './internals/useConstant';
import type {
	UnmappedOptions,
	Flags,
	MappedOptions,
	FieldOptions,
	DefaultUseFieldResultFlags,
	ToHtmlProps,
} from './internals/useFieldHelpers';
import type { ErrorsAtom } from './internals/ErrorsAtom';
import type { FieldTranslation } from './internals/FieldTranslation';
import type { FieldMapping } from './internals/FieldMapping';
import type { UseFieldResultFlags } from './internals/useFieldHelpers';
import type { IfTrueThenProp } from './internals/type-helpers';

export type UseFieldResult<
	TFieldValue,
	TFlags extends UseFieldResultFlags = DefaultUseFieldResultFlags,
> = {
	value: PrimitiveAtom<TFieldValue>;
	disabled: Atom<boolean>;
	readOnly: Atom<boolean>;
	setValue(v: TFieldValue | ((prev: TFieldValue) => TFieldValue)): void;
	getValue(): TFieldValue;
	errors?: ErrorsAtom;
	onChange(
		this: void,
		v: TFieldValue | ((prev: TFieldValue) => TFieldValue),
	): void;
	onBlur(this: void): void;
	htmlProps: ToHtmlProps<TFieldValue>;
	applyMapping<TNewValue>(
		mapping: FieldMapping<TFieldValue, TNewValue>,
	): UseFieldResult<TNewValue, TFlags>;
} & IfTrueThenProp<
	TFlags['hasErrors'],
	{ schema: ZodType<TFieldValue>; errors: ErrorsAtom }
> &
	IfTrueThenProp<TFlags['hasTranslations'], { translation: FieldTranslation }>;

function useInternalFieldAtom<TValue, TFieldValue>(
	fieldValueAtom: StandardWritableAtom<TValue>,
	options: Partial<FieldOptions<TValue, TFieldValue>> = {},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): UseFieldResult<TFieldValue, any> {
	const store = useStore();
	return useMemo(
		() => toInternalFieldAtom(store, fieldValueAtom, options),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[store, fieldValueAtom],
	);
}

export function useField<TValue, TOptions extends UnmappedOptions<TValue>>(
	defaultValue: TValue,
	options?: TOptions,
): UseFieldResult<TValue, Flags<TOptions>>;
export function useField<
	TValue,
	TFieldValue,
	TOptions extends MappedOptions<TValue, TFieldValue>,
>(
	defaultValue: TValue,
	options: TOptions,
): UseFieldResult<TFieldValue, Flags<TOptions>>;
export function useField<TValue, TFieldValue>(
	defaultValue: TValue,
	options: Partial<FieldOptions<TValue, TFieldValue>> = {},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): UseFieldResult<TFieldValue, any> {
	const fieldValueAtom = useConstant(() => atom<TValue>(defaultValue));
	return useInternalFieldAtom(fieldValueAtom, options);
}

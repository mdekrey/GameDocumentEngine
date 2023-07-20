import { Atom, PrimitiveAtom, atom, useStore } from 'jotai';
import { useMemo } from 'react';
import { ZodError, ZodType } from 'zod';
import type { Loadable } from 'node_modules/jotai/vanilla/utils/loadable';
import { StandardWritableAtom } from './StandardWritableAtom';
import { toInternalFieldAtom } from './toInternalFieldAtom';
import { RegisterErrorStrategy } from './errorsStrategy';
import { FormEvents } from './events/FormEvents';

export type DefaultUseFieldResultFlags = 'hasErrors';
export type UseFieldResultFlags = 'hasErrors' | 'isCheckbox';
export type ErrorsAtom<TValue> = Atom<Loadable<ZodError<TValue> | null>>;
export type UseFieldResult<
	TValue,
	TFieldValue = TValue,
	TFlags extends UseFieldResultFlags = DefaultUseFieldResultFlags,
> = {
	valueAtom: PrimitiveAtom<TValue>;
	setValue(v: TValue): void;
	getValue(): TValue;
	standardProps: 'isCheckbox' extends TFlags
		? CheckboxFieldProps<TFieldValue>
		: InputFieldProps<TFieldValue>;
	errors?: ErrorsAtom<TValue>;
} & ('hasErrors' extends TFlags ? { errors: ErrorsAtom<TValue> } : object);

export type InputFieldProps<TFieldValue> = {
	defaultValue: Atom<TFieldValue>;
	onChange: (ev: React.ChangeEvent<{ value: TFieldValue }>) => void;
	onBlur: React.ReactEventHandler;
};
export type CheckboxFieldProps<TFieldValue> = {
	defaultChecked: Atom<TFieldValue>;
	onChange: (ev: React.ChangeEvent<{ checked: TFieldValue }>) => void;
	onBlur: React.ReactEventHandler;
};

export type FieldMapping<TValue, TFormFieldValue> = {
	toForm(this: void, v: TValue): TFormFieldValue;
	fromForm(this: void, v: TFormFieldValue): TValue;
};
export type FieldOptions<TValue, TFormFieldValue> = {
	schema: ZodType<TValue>;
	mapping: FieldMapping<TValue, TFormFieldValue>;
	errorStrategy: RegisterErrorStrategy;
	formEvents: FormEvents;
	isCheckbox: boolean;
};
type UnmappedOptions<TValue> = Omit<
	Partial<FieldOptions<TValue, TValue>>,
	'mapping'
>;
type MappedOptions<TValue, TFieldValue> = Partial<
	FieldOptions<TValue, TFieldValue>
> & {
	mapping: FieldOptions<TValue, TFieldValue>['mapping'];
};

type Flags<TOptions extends Partial<FieldOptions<unknown, unknown>>> =
	| ('schema' extends keyof TOptions ? 'hasErrors' : never)
	| ({ isCheckbox: true } extends TOptions ? 'isCheckbox' : never);

export function useField<TValue, TOptions extends UnmappedOptions<TValue>>(
	defaultValue: TValue,
	options?: TOptions,
): UseFieldResult<TValue, TValue, Flags<TOptions>>;
export function useField<
	TValue,
	TFieldValue,
	TOptions extends MappedOptions<TValue, TFieldValue>,
>(
	defaultValue: TValue,
	options: TOptions,
): UseFieldResult<TValue, TFieldValue, Flags<TOptions>>;
export function useField<TValue, TFieldValue>(
	defaultValue: TValue,
	options: Partial<FieldOptions<TValue, TFieldValue>> = {},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): UseFieldResult<TValue, TFieldValue, any> {
	const fieldValueAtom = useMemo(
		() => atom<TValue>(defaultValue),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);
	return useInternalFieldAtom(fieldValueAtom, options);
}

export function useFieldAtom<TValue, TOptions extends UnmappedOptions<TValue>>(
	fieldValueAtom: StandardWritableAtom<TValue>,
	options?: TOptions,
): UseFieldResult<TValue, TValue, Flags<TOptions>>;
export function useFieldAtom<
	TValue,
	TFieldValue,
	TOptions extends MappedOptions<TValue, TFieldValue>,
>(
	fieldValueAtom: StandardWritableAtom<TValue>,
	options: TOptions,
): UseFieldResult<TValue, TFieldValue, Flags<TOptions>>;
export function useFieldAtom<TValue, TFieldValue>(
	fieldValueAtom: StandardWritableAtom<TValue>,
	options: Partial<FieldOptions<TValue, TFieldValue>> = {},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): UseFieldResult<TValue, TFieldValue, any> {
	return useInternalFieldAtom(fieldValueAtom, options);
}

function useInternalFieldAtom<TValue, TFieldValue>(
	fieldValueAtom: StandardWritableAtom<TValue>,
	options: Partial<FieldOptions<TValue, TFieldValue>> = {},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): UseFieldResult<TValue, TFieldValue, any> {
	const store = useStore();
	return useMemo(
		() => toInternalFieldAtom(store, fieldValueAtom, options),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[store, fieldValueAtom],
	);
}

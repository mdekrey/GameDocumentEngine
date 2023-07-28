import { Atom, PrimitiveAtom, atom, useStore } from 'jotai';
import { useMemo } from 'react';
import { ZodError, ZodType } from 'zod';
import type { Loadable } from 'node_modules/jotai/vanilla/utils/loadable';
import { StandardWritableAtom } from './StandardWritableAtom';
import { toInternalFieldAtom } from './toInternalFieldAtom';
import { RegisterErrorStrategy } from './errorsStrategy';
import { FormEvents } from './events/FormEvents';
import { IfTrueThenElse, IfTrueThenProp } from './type-helpers';

export type FieldTranslatablePart = ['label'] | ['errors', string];
export type FieldTranslation = (
	this: void,
	part: FieldTranslatablePart,
	otherField?: (string | number)[],
) => string;

export type DefaultUseFieldResultFlags = {
	hasErrors: true;
	isCheckbox: false;
	hasTranslations: true;
};
export type UseFieldResultFlags = {
	hasErrors: boolean;
	isCheckbox: boolean;
	hasTranslations: boolean;
};
export type ErrorsAtom<TValue> = Atom<Loadable<ZodError<TValue> | null>>;
export type UseFieldResult<
	TValue,
	TFieldValue = TValue,
	TFlags extends UseFieldResultFlags = DefaultUseFieldResultFlags,
> = {
	valueAtom: PrimitiveAtom<TValue>;
	setValue(v: TValue): void;
	getValue(): TValue;
	standardProps: IfTrueThenElse<
		TFlags['isCheckbox'],
		CheckboxFieldProps<TFieldValue>,
		InputFieldProps<TFieldValue>
	>;
	errors?: ErrorsAtom<TValue>;
	onChange(this: void, v: TValue): void;
	onBlur(this: void): void;
} & IfTrueThenProp<TFlags['hasErrors'], { errors: ErrorsAtom<TValue> }> &
	IfTrueThenProp<TFlags['hasTranslations'], { translation: FieldTranslation }>;

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
	translation: FieldTranslation;
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

type Flags<TOptions extends Partial<FieldOptions<unknown, unknown>>> = {
	hasErrors: 'schema' extends keyof TOptions ? true : false;
	isCheckbox: Exclude<TOptions['isCheckbox'], undefined>;
	hasTranslations: TOptions['translation'] extends FieldTranslation
		? true
		: false;
};

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

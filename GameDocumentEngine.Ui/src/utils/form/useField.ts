import { Atom, PrimitiveAtom, atom, useStore } from 'jotai';
import { useMemo } from 'react';
import { ZodError, ZodType } from 'zod';
import type { Loadable } from 'node_modules/jotai/vanilla/utils/loadable';
import { StandardWritableAtom } from './StandardWritableAtom';
import { toInternalFieldAtom } from './toInternalFieldAtom';
import { RegisterErrorStrategy } from './errorsStrategy';
import { FormEvents } from './events/FormEvents';
import { IfTrueThenProp } from './type-helpers';
import { noChange } from './mapAtom';

export type FieldTranslatablePart =
	| ['label']
	| ['description']
	| ['errors', string]
	| string;
export type FieldTranslation = (
	this: void,
	part: FieldTranslatablePart,
) => string;

export type DefaultUseFieldResultFlags = {
	hasErrors: true;
	hasTranslations: true;
};
export type UseFieldResultFlags = {
	hasErrors: boolean;
	hasTranslations: boolean;
};
export type ErrorsAtom = Atom<Loadable<ZodError | null>>;
export type UseFieldResult<
	TFieldValue,
	TFlags extends UseFieldResultFlags = DefaultUseFieldResultFlags,
> = {
	value: PrimitiveAtom<TFieldValue>;
	setValue(v: TFieldValue | ((prev: TFieldValue) => TFieldValue)): void;
	getValue(): TFieldValue;
	errors?: ErrorsAtom;
	onChange(
		this: void,
		v: TFieldValue | ((prev: TFieldValue) => TFieldValue),
	): void;
	onBlur(this: void): void;
	htmlProps: ToHtmlProps<TFieldValue>;
} & IfTrueThenProp<
	TFlags['hasErrors'],
	{ schema: ZodType<TFieldValue>; errors: ErrorsAtom }
> &
	IfTrueThenProp<TFlags['hasTranslations'], { translation: FieldTranslation }>;

export type ToHtmlInputProps<TInputValue> = TInputValue extends string
	? (mapping?: FieldMapping<TInputValue, string>) => InputHtmlProps
	: (mapping: FieldMapping<TInputValue, string>) => InputHtmlProps;

export type ToHtmlProps<TInputValue> = ToHtmlInputProps<TInputValue> & {
	asCheckbox: TInputValue extends boolean
		? (mapping?: FieldMapping<TInputValue, boolean>) => CheckboxHtmlProps
		: (mapping: FieldMapping<TInputValue, boolean>) => CheckboxHtmlProps;
};

export type InputHtmlProps = {
	defaultValue: Atom<string>;
	onChange: React.ChangeEventHandler<{ value: string }>;
	onBlur: React.FocusEventHandler<{ value: string }>;
};
export type CheckboxHtmlProps = {
	defaultChecked: Atom<boolean>;
	onChange: React.ChangeEventHandler<{ checked: boolean }>;
	onBlur: React.FocusEventHandler<{ checked: boolean }>;
};

export type FieldMapping<TValue, TFormFieldValue> = {
	toForm(this: void, v: TValue): TFormFieldValue;
	fromForm(this: void, v: TFormFieldValue): TValue | typeof noChange;
};

export type FieldOptions<TValue, TFormFieldValue> = {
	schema: ZodType<TValue>;
	mapping: FieldMapping<TValue, TFormFieldValue>;
	errorStrategy: RegisterErrorStrategy;
	formEvents: FormEvents;
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
	hasTranslations: TOptions['translation'] extends FieldTranslation
		? true
		: false;
};

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
): UseFieldResult<TValue, Flags<TOptions>>;
export function useFieldAtom<
	TValue,
	TFieldValue,
	TOptions extends MappedOptions<TValue, TFieldValue>,
>(
	fieldValueAtom: StandardWritableAtom<TValue>,
	options: TOptions,
): UseFieldResult<TFieldValue, Flags<TOptions>>;
export function useFieldAtom<TValue, TFieldValue>(
	fieldValueAtom: StandardWritableAtom<TValue>,
	options: Partial<FieldOptions<TValue, TFieldValue>> = {},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): UseFieldResult<TFieldValue, any> {
	return useInternalFieldAtom(fieldValueAtom, options);
}

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

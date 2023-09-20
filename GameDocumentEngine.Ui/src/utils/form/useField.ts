import type { Atom, PrimitiveAtom } from 'jotai';
import { atom, useStore } from 'jotai';
import { useMemo } from 'react';
import type { ZodError, ZodType } from 'zod';
import type { Loadable } from 'node_modules/jotai/vanilla/utils/loadable';
import type { StandardWritableAtom } from './StandardWritableAtom';
import { toInternalFieldAtom } from './toInternalFieldAtom';
import type { RegisterErrorStrategy } from './errorsStrategy';
import type { FormEvents } from './events/FormEvents';
import type { IfTrueThenProp } from './type-helpers';
import type { noChange } from './mapAtom';

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
} & IfTrueThenProp<
	TFlags['hasErrors'],
	{ schema: ZodType<TFieldValue>; errors: ErrorsAtom }
> &
	IfTrueThenProp<TFlags['hasTranslations'], { translation: FieldTranslation }>;

export type ToHtmlInputProps<TInputValue> = TInputValue extends string
	? (mapping?: FieldMapping<TInputValue, string>) => InputHtmlProps
	: (mapping: FieldMapping<TInputValue, string>) => InputHtmlProps;

export type ToHtmlProps<TInputValue> = ToHtmlInputProps<TInputValue> & {
	asControlled: () => ControlledHtmlProps<TInputValue>;
	asCheckbox: TInputValue extends boolean
		? (mapping?: FieldMapping<TInputValue, boolean>) => CheckboxHtmlProps
		: (mapping: FieldMapping<TInputValue, boolean>) => CheckboxHtmlProps;
};

export type CommonEventHandler<TTarget = never> = [TTarget] extends [never]
	? () => void
	: (ev: { currentTarget: TTarget }) => void;

export type InputHtmlProps = {
	defaultValue: Atom<string>;
	onChange: CommonEventHandler<{ value: string }>;
	onBlur: CommonEventHandler<{ value: string }>;
	disabled: Atom<boolean>;
	readOnly: Atom<boolean>;
};
export type ControlledHtmlProps<T> = {
	value: StandardWritableAtom<T>;
	onChange: CommonEventHandler<{ value: T }>;
	onBlur: CommonEventHandler;
	disabled: Atom<boolean>;
	readOnly: Atom<boolean>;
};
export type CheckboxHtmlProps = {
	defaultChecked: Atom<boolean>;
	onChange: CommonEventHandler<{ checked: boolean }>;
	onBlur: CommonEventHandler<{ checked: boolean }>;
	disabled: Atom<boolean>;
};

export type FieldMapping<TValue, TFormFieldValue> = {
	toForm(this: void, v: TValue): TFormFieldValue;
	fromForm(this: void, v: TFormFieldValue): TValue | typeof noChange;
};

//
export const noErrorsAtom: ErrorsAtom = atom({ state: 'hasData', data: null });
export type FieldStateContext<TFieldValue> = {
	value: Atom<TFieldValue>;
	/** If no schema is provided, will be noErrorsAtom */
	errors: ErrorsAtom;
};

export type FieldStateCallback<T, TFieldValue> = (
	context: FieldStateContext<TFieldValue>,
) => Atom<T>;

export type FieldStateBoolean<TFieldValue> =
	| boolean
	| Atom<boolean>
	| FieldStateCallback<boolean, TFieldValue>;

export type FieldOptions<TValue, TFormFieldValue> = {
	schema: ZodType<TValue>;
	mapping: FieldMapping<TValue, TFormFieldValue>;
	errorStrategy: RegisterErrorStrategy;
	formEvents: FormEvents;
	translation: FieldTranslation;
	disabled: FieldStateBoolean<TFormFieldValue>;
	readOnly: FieldStateBoolean<TFormFieldValue>;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFieldOptions = FieldOptions<any, any>;
type Flags<TOptions extends Partial<AnyFieldOptions>> = {
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

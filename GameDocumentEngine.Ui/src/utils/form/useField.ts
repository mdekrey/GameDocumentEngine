import { Atom, PrimitiveAtom, atom, useStore } from 'jotai';
import { useMemo } from 'react';
import { withSignal, mapProperty } from '@principlestudios/jotai-react-signals';
import { ZodError, ZodType } from 'zod';
import type { Loadable } from 'node_modules/jotai/vanilla/utils/loadable';
import { StandardWritableAtom } from './StandardWritableAtom';
import { toInternalFieldAtom } from './toInternalFieldAtom';
import { RegisterErrorStrategy } from './errorsStrategy';
import { FormEvents } from './events/FormEvents';
import { FieldEvents } from './events/FieldEvents';

export const JotaiInput = withSignal('input', {
	defaultValue: mapProperty('value'),
});

export type UseFieldResultFlags = 'hasErrors';
export type ErrorsAtom<TValue> = Atom<Loadable<ZodError<TValue> | null>>;
export type UseFieldResult<
	TValue,
	TFieldValue = TValue,
	TFlags extends UseFieldResultFlags = UseFieldResultFlags,
> = {
	valueAtom: PrimitiveAtom<TValue>;
	setValue(v: TValue): void;
	getValue(): TValue;
	standardProps: InputFieldProps<TFieldValue>;
	errors?: ErrorsAtom<TValue>;
} & ('hasErrors' extends TFlags ? { errors: ErrorsAtom<TValue> } : object);

export type InputFieldProps<TFieldValue> = {
	defaultValue: StandardWritableAtom<TFieldValue>;
	onChange: (ev: React.ChangeEvent<{ value: TFieldValue }>) => void;
	onBlur: React.ReactEventHandler;
};

export function toInputField<TFieldValue>(
	store: ReturnType<typeof useStore>,
	atom: StandardWritableAtom<TFieldValue>,
	fieldEvents: FieldEvents,
): InputFieldProps<TFieldValue> {
	return {
		defaultValue: atom,
		onChange: (ev) => {
			fieldEvents.dispatchEvent(FieldEvents.Change);
			store.set(atom, ev.currentTarget.value);
		},
		onBlur: () => {
			fieldEvents.dispatchEvent(FieldEvents.Blur);
		},
	};
}

export type FieldMapping<TValue, TFormFieldValue> = {
	toForm(this: void, v: TValue): TFormFieldValue;
	fromForm(this: void, v: TFormFieldValue): TValue;
};
export type FieldOptions<TValue, TFormFieldValue> = {
	schema: ZodType<TValue>;
	mapping: FieldMapping<TValue, TFormFieldValue>;
	errorStrategy: RegisterErrorStrategy;
	formEvents: FormEvents;
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
	'schema' extends keyof TOptions ? 'hasErrors' : never;

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
): UseFieldResult<TValue, TFieldValue, never> {
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
): UseFieldResult<TValue, TFieldValue, never> {
	return useInternalFieldAtom(fieldValueAtom, options);
}

function useInternalFieldAtom<TValue, TFieldValue>(
	fieldValueAtom: StandardWritableAtom<TValue>,
	options: Partial<FieldOptions<TValue, TFieldValue>> = {},
): UseFieldResult<TValue, TFieldValue, never> {
	const store = useStore();
	return useMemo(
		() => toInternalFieldAtom(store, fieldValueAtom, options),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[store, fieldValueAtom],
	);
}

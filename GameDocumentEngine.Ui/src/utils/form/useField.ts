import { Atom, PrimitiveAtom, atom, useStore } from 'jotai';
import { loadable } from 'jotai/utils';
import { useMemo } from 'react';
import { withSignal, mapProperty } from '@principlestudios/jotai-react-signals';
import { ZodError, ZodType } from 'zod';
import type { Loadable } from 'node_modules/jotai/vanilla/utils/loadable';
import { SetStateAction, StandardWritableAtom } from './StandardWritableAtom';

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

function mapAtom<TIn, TOut>(
	target: StandardWritableAtom<TIn>,
	toOut: (v: TIn) => TOut,
	fromOut: (v: TOut) => TIn,
): StandardWritableAtom<TOut> {
	return atom(
		(get) => toOut(get(target)),
		(_get, set, effect: TOut | SetStateAction<TOut>) =>
			set(target, (prev) =>
				fromOut(
					typeof effect === 'function'
						? (effect as SetStateAction<TOut>)(toOut(prev))
						: effect,
				),
			),
	);
}

export type InputFieldProps<TFieldValue> = {
	defaultValue: StandardWritableAtom<TFieldValue>;
	onChange: (ev: React.ChangeEvent<{ value: TFieldValue }>) => void;
};

function toInputField<TFieldValue>(
	store: ReturnType<typeof useStore>,
	atom: StandardWritableAtom<TFieldValue>,
): InputFieldProps<TFieldValue> {
	return {
		defaultValue: atom,
		onChange: (ev) => {
			store.set(atom, ev.currentTarget.value);
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

export function createErrorsAtom<T>(target: Atom<T>, schema: ZodType<T>) {
	return loadable(
		atom(async (get) => {
			const parseResult = await schema.safeParseAsync(get(target));
			if (parseResult.success) return null;
			return parseResult.error;
		}),
	);
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

export function toInternalFieldAtom<TValue, TFieldValue>(
	store: ReturnType<typeof useStore>,
	fieldValueAtom: StandardWritableAtom<TValue>,
	options: Partial<FieldOptions<TValue, TFieldValue>> = {},
): UseFieldResult<TValue, TFieldValue, never> {
	const mapping = 'mapping' in options ? options.mapping : null;
	const formValueAtom = mapping
		? mapAtom<TValue, TFieldValue>(
				fieldValueAtom,
				mapping.toForm,
				mapping.fromForm,
		  )
		: (fieldValueAtom as unknown as StandardWritableAtom<TFieldValue>);

	const schema = 'schema' in options ? options.schema : null;
	const errors = schema ? createErrorsAtom(fieldValueAtom, schema) : undefined;

	const standardProps = toInputField(store, formValueAtom);

	const result: UseFieldResult<TValue, TFieldValue, never> = {
		valueAtom: fieldValueAtom,
		setValue: (v: TValue) => store.set(fieldValueAtom, v),
		getValue: () => store.get(fieldValueAtom),
		standardProps,
		errors,
	};
	return result;
}

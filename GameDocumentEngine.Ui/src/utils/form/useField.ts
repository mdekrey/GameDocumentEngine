import { Atom, PrimitiveAtom, WritableAtom, atom, useStore } from 'jotai';
import { loadable } from 'jotai/utils';
import { useMemo } from 'react';
import { withSignal, mapProperty } from '@principlestudios/jotai-react-signals';
import { ZodError, ZodType, ZodTypeDef } from 'zod';
import type { Loadable } from 'node_modules/jotai/vanilla/utils/loadable';

export const JotaiInput = withSignal('input', {
	defaultValue: mapProperty('value'),
});

// eslint-disable-next-line @typescript-eslint/ban-types
type NotFunction<T> = Exclude<T, Function>;

export type UseFieldResultFlags = 'hasErrors';
export type ErrorsAtom<TValue> = Atom<Loadable<ZodError<TValue> | null>>;
export type UseFieldResult<
	TValue,
	TFieldValue,
	TFlags extends UseFieldResultFlags,
> = {
	valueAtom: PrimitiveAtom<TValue>;
	setValue(v: TValue): void;
	getValue(): TValue;
	standardProps: InputFieldProps<TFieldValue>;
	errors?: ErrorsAtom<TValue>;
} & ('hasErrors' extends TFlags ? { errors: ErrorsAtom<TValue> } : object);

type SetStateAction<T> = (prev: T) => T;
type StandardWritableAtom<Value> = WritableAtom<
	Value,
	[Value | SetStateAction<Value>],
	void
>;
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

export function useInputField<TFieldValue>(
	atom: StandardWritableAtom<TFieldValue>,
): InputFieldProps<TFieldValue> {
	const store = useStore();
	return {
		defaultValue: atom,
		onChange: (ev) => {
			store.set(atom, ev.currentTarget.value);
		},
	};
}

type FieldOptions<TValue, TFormFieldValue> = {
	schema: ZodType<TValue, ZodTypeDef, TValue>;
	mapping: {
		toForm(this: void, v: TValue): TFormFieldValue;
		fromForm(this: void, v: TFormFieldValue): TValue;
	};
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
	defaultValue: NotFunction<TValue>,
	options?: TOptions,
): UseFieldResult<NotFunction<TValue>, NotFunction<TValue>, Flags<TOptions>>;
export function useField<
	TValue,
	TFieldValue,
	TOptions extends MappedOptions<TValue, TFieldValue>,
>(
	defaultValue: NotFunction<TValue>,
	options: TOptions,
): UseFieldResult<TValue, TFieldValue, Flags<TOptions>>;
export function useField<TValue, TFieldValue>(
	defaultValue: NotFunction<TValue>,
	options: Partial<FieldOptions<TValue, TFieldValue>> = {},
): UseFieldResult<TValue, TFieldValue, never> {
	const fieldValueAtom = useMemo(
		() => atom<TValue>(defaultValue),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);
	const formValueAtom = useMemo(
		() => {
			const mapping = 'mapping' in options ? options.mapping : null;
			return mapping
				? mapAtom<TValue, TFieldValue>(
						fieldValueAtom,
						mapping.toForm,
						mapping.fromForm,
				  )
				: (fieldValueAtom as unknown as StandardWritableAtom<TFieldValue>);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[fieldValueAtom],
	);
	const errors = useMemo(
		() => {
			const schema = 'schema' in options ? options.schema : null;
			return schema
				? loadable(
						atom(async (get) => {
							const parseResult = await schema.safeParseAsync(
								get(fieldValueAtom),
							);
							if (parseResult.success) return null;
							return parseResult.error;
						}),
				  )
				: undefined;
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	const standardProps = useInputField(formValueAtom);
	const store = useStore();

	const result: UseFieldResult<TValue, TFieldValue, never> = {
		valueAtom: fieldValueAtom,
		setValue: (v: TValue) => store.set(fieldValueAtom, v),
		getValue: () => store.get(fieldValueAtom),
		standardProps,
		errors,
	};
	return result;
}

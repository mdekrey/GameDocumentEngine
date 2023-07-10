import { PrimitiveAtom, WritableAtom, atom, useStore } from 'jotai';
import { useMemo } from 'react';
import { withSignal, mapProperty } from '@principlestudios/jotai-react-signals';

export const JotaiInput = withSignal('input', {
	defaultValue: mapProperty('value'),
});

// eslint-disable-next-line @typescript-eslint/ban-types
type NotFunction<T> = Exclude<T, Function>;

export type UseFieldResult<TValue, TFieldValue> = {
	valueAtom: PrimitiveAtom<TValue>;
	setValue(v: TValue): void;
	getValue(): TValue;
	standardProps: InputFieldProps<TFieldValue>;
};

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
	mapping: {
		toForm(this: void, v: TValue): TFormFieldValue;
		fromForm(this: void, v: TFormFieldValue): TValue;
	};
};
type UnmappedFieldOptions<TValue> = Omit<
	FieldOptions<TValue, never>,
	'mapping'
>;

export function useField<TValue>(
	defaultValue: NotFunction<TValue>,
	options?: UnmappedFieldOptions<TValue>,
): UseFieldResult<NotFunction<TValue>, NotFunction<TValue>>;
export function useField<TValue, TFieldValue>(
	defaultValue: NotFunction<TValue>,
	options: FieldOptions<TValue, TFieldValue>,
): UseFieldResult<TValue, TFieldValue>;
export function useField<TValue, TFieldValue>(
	defaultValue: NotFunction<TValue>,
	options:
		| FieldOptions<TValue, TFieldValue>
		| UnmappedFieldOptions<TValue>
		| undefined = {},
): UseFieldResult<TValue, TFieldValue> {
	const fieldValueAtom = useMemo(
		() => atom<TValue>(defaultValue),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);
	const formValueAtom = useMemo(
		() =>
			'mapping' in options
				? mapAtom<TValue, TFieldValue>(
						fieldValueAtom,
						options.mapping.toForm,
						options.mapping.fromForm,
				  )
				: (fieldValueAtom as unknown as StandardWritableAtom<TFieldValue>),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[fieldValueAtom],
	);

	const standardProps = useInputField(formValueAtom);
	const store = useStore();

	return {
		valueAtom: fieldValueAtom,
		setValue: (v: TValue) => store.set(fieldValueAtom, v),
		getValue: () => store.get(fieldValueAtom),
		standardProps,
	};
}

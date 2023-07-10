import { Atom, PrimitiveAtom, WritableAtom, atom, useStore } from 'jotai';
import { ComponentProps, useMemo } from 'react';
import { withSignal, mapProperty } from '@principlestudios/jotai-react-signals';

export const JotaiInput = withSignal('input', {
	defaultValue: mapProperty('value'),
});

type NotFunction<T> = Exclude<T, Function>;

function identity<T>(v: T) {
	return v;
}

export type UseFieldResult<TValue> = {
	valueAtom: PrimitiveAtom<TValue>;
	setValue(v: TValue): void;
	getValue(): TValue;
	standardProps: Partial<ComponentProps<typeof JotaiInput>>;
};

type SetStateAction<T> = (prev: T) => T;
type StandardWritableAtom<Value> = WritableAtom<
	Value,
	[Value | SetStateAction<Value>],
	void
>;
function mapAtom<TIn, TOut>(
	target: StandardWritableAtom<TIn>,
	toNormal: (v: TIn) => TOut,
	fromNormal: (v: TOut) => TIn,
): StandardWritableAtom<TOut> {
	return atom(
		(get) => toNormal(get(target)),
		(_get, set, effect: TOut | SetStateAction<TOut>) =>
			set(target, (prev) =>
				fromNormal(
					typeof effect === 'function'
						? (effect as SetStateAction<TOut>)(toNormal(prev))
						: effect,
				),
			),
	);
}

export function useInputField(
	atom: StandardWritableAtom<string>,
): Partial<ComponentProps<typeof JotaiInput>> {
	const store = useStore();
	return {
		defaultValue: atom,
		onChange: (ev: React.ChangeEvent<HTMLInputElement>) => {
			store.set(atom, ev.currentTarget.value);
		},
	};
}

export function useField<TValue>(
	defaultValue: NotFunction<TValue>,
): UseFieldResult<NotFunction<TValue>>;
export function useField<TValue>(
	defaultValue: NotFunction<TValue>,
	toNormal: (v: TValue) => string,
	fromNormal: (v: string) => TValue,
): UseFieldResult<TValue>;
export function useField<TValue>(
	defaultValue: NotFunction<TValue>,
	toNormal?: (v: TValue) => string,
	fromNormal?: (v: string) => TValue,
): UseFieldResult<TValue> {
	const actualToNormal =
		toNormal ?? (identity as unknown as NonNullable<typeof toNormal>);
	const actualFromNormal =
		fromNormal ?? (identity as unknown as NonNullable<typeof fromNormal>);
	const fieldValueAtom = useMemo(() => atom<TValue>(defaultValue), []);
	const formValueAtom = useMemo(
		() =>
			mapAtom<TValue, string>(fieldValueAtom, actualToNormal, actualFromNormal),
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

import { atom } from 'jotai';
import { SetStateAction, StandardWritableAtom } from './StandardWritableAtom';

export function mapAtom<TIn, TOut>(
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

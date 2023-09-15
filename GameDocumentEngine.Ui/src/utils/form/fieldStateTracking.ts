import { WritableAtom, atom } from 'jotai';
import { AnyPath } from './path';
import { produce } from 'immer';

export type SetStateNoInitialAction<T> = (prev: T | undefined) => T;

export const defaultField = Symbol('Default field');
export type FieldStatePrimitive = string | number | symbol | bigint | boolean;
export type PerFieldState<T extends FieldStatePrimitive> =
	| {
			[field: string | number | symbol]: PerFieldState<T>;
	  }
	| T;
export type FieldStateAtom<T extends FieldStatePrimitive> = WritableAtom<
	PerFieldState<T>,
	[PerFieldState<T> | SetStateNoInitialAction<PerFieldState<T>>],
	void
>;

export function walkFieldState<T extends FieldStatePrimitive>(
	fieldState: PerFieldState<T>,
	path: AnyPath,
): PerFieldState<T> {
	if (
		typeof fieldState === 'object' &&
		fieldState !== null &&
		path.length > 0
	) {
		return walkFieldState(
			fieldState[path[0]] ?? fieldState[defaultField],
			path.slice(1),
		);
	}
	return fieldState;
}

function ensureValue<T extends FieldStatePrimitive>(
	fieldState: PerFieldState<T>,
) {
	if (typeof fieldState === 'object' && defaultField in fieldState)
		return fieldState[defaultField];
	return fieldState;
}

export function toAtomFieldState<T extends FieldStatePrimitive>(
	initial: PerFieldState<T>,
): FieldStateAtom<T> {
	const rawAtom: FieldStateAtom<T> = atom(initial);
	return rawAtom;
}

function updateFieldState<T extends FieldStatePrimitive>(
	fieldState: undefined | PerFieldState<T>,
	path: AnyPath,
	alteration: SetStateNoInitialAction<PerFieldState<T>>,
): PerFieldState<T> {
	if (path.length === 0) return alteration(fieldState as PerFieldState<T>);
	if (typeof fieldState === 'object') {
		return produce(fieldState, (draft: PerFieldState<T> & object) => {
			draft[path[0]] =
				path[0] in draft
					? updateFieldState(draft[path[0]], path.slice(1), alteration)
					: defaultField in draft
					? updateFieldState(draft[defaultField], path.slice(1), alteration)
					: updateFieldState(undefined, path.slice(1), alteration);
		});
	}
	const result: PerFieldState<T> & object = {};
	if (typeof fieldState !== 'undefined') {
		result[defaultField] = fieldState;
	}
	result[path[0]] = updateFieldState(fieldState, path.slice(1), alteration);
	return result;
}

export function walkFieldStateAtom<T extends FieldStatePrimitive>(
	fieldState: FieldStateAtom<T>,
	path: AnyPath,
): FieldStateAtom<T> {
	return atom(
		(get) => walkFieldState(get(fieldState), path),
		(get, set, action) => {
			set(
				fieldState,
				produce<PerFieldState<T>>((prev) => {
					return updateFieldState(
						prev as PerFieldState<T>,
						path,
						typeof action === 'function' ? action : () => action,
					);
				}),
			);
		},
	);
}

export function walkFieldStateAtomValue<T extends FieldStatePrimitive>(
	fieldState: FieldStateAtom<T>,
	path: AnyPath,
): FieldStateAtom<T> {
	return atom(
		(get) => ensureValue(walkFieldState(get(fieldState), path)),
		(get, set, action) => {
			set(
				fieldState,
				produce<PerFieldState<T>>((prev) => {
					return updateFieldState(
						prev as PerFieldState<T>,
						path,
						typeof action === 'function' ? action : () => action,
					);
				}),
			);
		},
	);
}

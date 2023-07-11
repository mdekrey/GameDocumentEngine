/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Atom, atom, useStore } from 'jotai';
import { useMemo } from 'react';
import { ZodError, ZodType, ZodTypeAny } from 'zod';
import { SetStateAction, StandardWritableAtom } from './StandardWritableAtom';
import { Path, PathValue } from './path';
import { applyPatches, produceWithPatches, Patch, Objectish } from 'immer';
import { createErrorsAtom, useFieldAtom } from './useField';
import { Loadable } from 'node_modules/jotai/vanilla/utils/loadable';

export type FormOptions<T extends Objectish> = {
	schema: ZodType<T>;
	defaultValue: T;
};

export type UseFormResult<T extends Objectish> = {
	store: ReturnType<typeof useStore>;
	atom: StandardWritableAtom<T>;
	schema: ZodType<T>;
	errors: Atom<Loadable<ZodError<T> | null>>;
	get(this: void): T;
	subset<TPath extends Path<T>>(
		this: void,
		path: TPath,
	): UseFormResult<PathValue<T, TPath>>;
};

function buildFormResult<T extends Objectish>(
	store: ReturnType<typeof useStore>,
	atom: StandardWritableAtom<T>,
	schema: ZodType<T>,
): UseFormResult<T> {
	const errorsAtom = createErrorsAtom(atom, schema);
	return {
		store,
		atom,
		schema,
		errors: errorsAtom,
		get: () => store.get(atom),
		subset: (path) => toFormSubset(path, { store, atom, schema }),
	};
}

export function useForm<T extends Objectish>(
	options: FormOptions<T>,
): UseFormResult<T> {
	const store = useStore();
	const formAtom = useMemo(
		() => atom(options.defaultValue),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	return buildFormResult(store, formAtom, options.schema);
}

function getZodSchemaForPath<T, TPath extends Path<T>>(
	steps: TPath,
	schema: ZodType<T>,
): ZodType<PathValue<T, TPath>> {
	return (steps as ReadonlyArray<string | number>).reduce(
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		(prev, next) => doStep(next, prev),
		schema,
	) as ZodType<PathValue<T, TPath>>;

	function doStep(step: string | number, current: ZodTypeAny): ZodTypeAny {
		if ('shape' in current) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
			return (current.shape as any)[step];
		} else if ('element' in current) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
			return (current as any).element;
		} else {
			console.error('during', { steps, schema }, 'unable to continue at', {
				step,
				current,
			});
			throw new Error('Unable to walk zod path; see console');
		}
	}
}

function getAtomForPath<T extends Objectish, TPath extends Path<T>>(
	steps: TPath,
	source: StandardWritableAtom<T>,
) {
	type TOut = PathValue<T, TPath>;

	const getPathValue = (input: T) =>
		(steps as ReadonlyArray<string | number>).reduce(
			(prev, next) => (prev as never)[next],
			input as unknown,
		) as PathValue<T, TPath>;
	const resultAtom = atom(
		(get): PathValue<T, TPath> => getPathValue(get(source)),
		(_get, set, effect: TOut | SetStateAction<TOut>) =>
			set(source, (prev) => {
				const patches: Patch[] =
					typeof effect === 'function'
						? produceWithPatches<PathValue<T, TPath>>(getPathValue(prev), (d) =>
								(effect as SetStateAction<TOut>)(d as TOut),
						  )[1]
						: [{ op: 'replace', path: [], value: effect }];
				const finalPatches = patches.map(
					(patch): Patch => ({ ...patch, path: [...steps, ...patch.path] }),
				);
				return applyPatches(prev, finalPatches);
			}),
	);
	return resultAtom;
}

function toFormSubset<T extends Objectish, TPath extends Path<T>>(
	steps: TPath,
	options: Pick<UseFormResult<T>, 'store' | 'atom' | 'schema'>,
): UseFormResult<PathValue<T, TPath>> {
	const schema = getZodSchemaForPath(steps, options.schema);
	const resultAtom = getAtomForPath(steps, options.atom);

	return buildFormResult(options.store, resultAtom, schema);
}

export function useFormField<T extends Objectish, TPath extends Path<T>>(
	steps: TPath,
	options: UseFormResult<T>,
) {
	const fieldAtomMemo = useMemo(
		() => getAtomForPath(steps, options.atom),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[...steps, options.atom],
	);

	return useFieldAtom(fieldAtomMemo, {
		schema: getZodSchemaForPath(steps, options.schema),
	});
}

import { Atom, WritableAtom, atom } from 'jotai';
import { loadable } from 'jotai/utils';
import type { Loadable } from 'node_modules/jotai/vanilla/utils/loadable';
import { ZodError, ZodType } from 'zod';

export function createErrorsAtom<T>(target: Atom<T>, schema: ZodType<T>) {
	return loadable(
		atom(async (get) => {
			const parseResult = await schema.safeParseAsync(get(target));
			if (parseResult.success) return null;
			return parseResult.error;
		}),
	);
}

type MaybeErrors<T> = ZodError<T> | null;

export function createTriggeredErrorsAtom<T>(
	target: Atom<T>,
	schema: ZodType<T>,
): [Atom<Loadable<ZodError<T> | null>>, WritableAtom<void, [], void>] {
	const errors = atom<Promise<MaybeErrors<T>>>(Promise.resolve(null));

	const writable = atom<void, [], void>(void 0, (get, set) => {
		console.log('trigger!');
		set(
			errors,
			(async () => {
				const parseResult = await schema.safeParseAsync(get(target));
				if (parseResult.success) return null;
				return parseResult.error;
			})(),
		);
	});

	return [loadable(errors), writable];
}

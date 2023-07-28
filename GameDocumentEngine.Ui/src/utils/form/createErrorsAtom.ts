import { Atom, WritableAtom, atom } from 'jotai';
import { loadable } from 'jotai/utils';
import type { Loadable } from 'node_modules/jotai/vanilla/utils/loadable';
import { ZodError, ZodType } from 'zod';

type MaybeErrors = ZodError | null;

export function createErrorsAtom<T>(
	target: Atom<T>,
	schema: ZodType<T>,
): Atom<Loadable<MaybeErrors>> {
	return loadable(
		atom(async (get) => {
			const parseResult = await schema.safeParseAsync(get(target));
			if (parseResult.success) return null;
			return parseResult.error;
		}),
	);
}

export function createTriggeredErrorsAtom<T>(
	target: Atom<T>,
	schema: ZodType<T>,
): [Atom<Loadable<MaybeErrors>>, WritableAtom<void, [], void>] {
	const errors = atom<Promise<MaybeErrors>>(Promise.resolve(null));

	const writable = atom<void, [], void>(void 0, (get, set) => {
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

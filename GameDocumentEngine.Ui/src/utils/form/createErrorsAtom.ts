import { Atom, atom } from 'jotai';
import { loadable } from 'jotai/utils';
import { ZodType } from 'zod';

export function createErrorsAtom<T>(target: Atom<T>, schema: ZodType<T>) {
	return loadable(
		atom(async (get) => {
			const parseResult = await schema.safeParseAsync(get(target));
			if (parseResult.success) return null;
			return parseResult.error;
		}),
	);
}

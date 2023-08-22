import { isAtom, useComputedAtom } from '@principlestudios/jotai-react-signals';
import type { Atom } from 'jotai';
import type { ClassNameValue} from 'tailwind-merge';
import { twMerge } from 'tailwind-merge';

type JotaiTwMergeParam = ClassNameValue | Atom<ClassNameValue>;

export function useTwMerge(...params: JotaiTwMergeParam[]) {
	return useComputedAtom((get) =>
		twMerge(...params.map((p) => (isAtom(p) ? get(p) : p))),
	);
}

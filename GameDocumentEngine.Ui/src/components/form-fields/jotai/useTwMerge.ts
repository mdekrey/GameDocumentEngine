import { isAtom, useComputedAtom } from '@principlestudios/jotai-react-signals';
import { Atom } from 'jotai';
import { ClassNameValue, twMerge } from 'tailwind-merge';

type JotaiTwMergeParam = ClassNameValue | Atom<ClassNameValue>;

export function useTwMerge(...params: JotaiTwMergeParam[]) {
	return useComputedAtom((get) =>
		twMerge(...params.map((p) => (isAtom(p) ? get(p) : p))),
	);
}

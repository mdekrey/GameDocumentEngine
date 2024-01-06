import type { Atom } from 'jotai';
import { useStore } from 'jotai';
import { useEffect, useRef } from 'react';

export function useAtomSubscription<T>(
	atom: Atom<T>,
	callback: (value: T) => void | Promise<void>,
) {
	const store = useStore();
	const cbRef = useRef(callback);
	cbRef.current = callback;
	useEffect(() => {
		return store.sub(atom, () => {
			void cbRef.current(store.get(atom));
		});
	}, [atom, store]);
}

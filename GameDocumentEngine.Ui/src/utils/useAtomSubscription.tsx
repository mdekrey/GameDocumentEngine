import type { Atom } from 'jotai';
import { useStore } from 'jotai';
import { useEffect, useRef } from 'react';

export function useAtomSubscription<T>(
	atom: Atom<T>,
	callback: (value: T) => void | Promise<void>,
	invokeOnMount?: true,
) {
	const store = useStore();
	const cbRef = useRef(callback);
	cbRef.current = callback;
	useEffect(() => {
		if (invokeOnMount) void cbRef.current(store.get(atom));
		return store.sub(atom, () => {
			void cbRef.current(store.get(atom));
		});
	}, [atom, store, invokeOnMount]);
}

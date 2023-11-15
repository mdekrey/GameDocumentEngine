import type { FormFieldReturnType } from '@/utils/form';
import { useAtomValue, useSetAtom } from 'jotai';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { useCallback } from 'react';
import { produce } from 'immer';

export function useFieldList<T>(
	field: FormFieldReturnType<T[]>,
	item: (index: number) => FormFieldReturnType<T>,
	defaultValue: T,
) {
	// TODO: the form library is restricting `Path<T[]>` from being `[number]`, making this all harder than it needs to be
	const length = useAtomValue(useComputedAtom((get) => get(field.atom).length));
	const setter = useSetAtom(field.atom);
	const addItem = useCallback(
		function addItem() {
			setter((items) => produce(items, (d: T[]) => void d.push(defaultValue)));
		},
		[setter, defaultValue],
	);
	const removeItem = useCallback(
		function removeItem(index: number) {
			setter((items) => {
				return produce(items, (d: T[]) => {
					return d.filter((_, i) => i !== index);
				});
			});
		},
		[setter],
	);

	return { length, addItem, removeItem, item };
}

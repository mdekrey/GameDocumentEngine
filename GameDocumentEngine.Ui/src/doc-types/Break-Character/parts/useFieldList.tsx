import { useFormFields, type FormFieldReturnType } from '@/utils/form';
import { useAtomValue } from 'jotai';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { useCallback, useRef } from 'react';

export function useFieldList<T>(
	field: FormFieldReturnType<T[]>,
	defaultValue: T,
	toKey?: (this: void, item: T) => React.Key | undefined,
): {
	length: number;
	addItem(this: void): void;
	removeItem(this: void, index: number): void;
	item(this: void, index: number): FormFieldReturnType<T>;
	key(this: void, index: number): React.Key;
	mutateKeys(this: void, mutator: (keys: React.Key[]) => React.Key[]): void;
} {
	const keys = useRef<React.Key[]>([]);
	const { item } = useFormFields(field, {
		item: (index: number) => ({
			path: [index] as const,
			translationPath: [],
		}),
	});
	const length = useAtomValue(useComputedAtom((get) => get(field.atom).length));
	if (keys.current.length !== length) {
		keys.current = field.get().map((v) => toKey?.(v) ?? crypto.randomUUID());
	}
	const addItem = useCallback(
		function addItem() {
			field.onChange((items) => [...items, defaultValue]);
		},
		[field, defaultValue],
	);
	const removeItem = useCallback(
		function removeItem(index: number) {
			field.onChange((items) => items.filter((_, i) => i !== index));
		},
		[field],
	);

	return {
		length,
		addItem,
		removeItem,
		item: item as (index: number) => FormFieldReturnType<T>,
		key(index) {
			return keys.current[index];
		},
		mutateKeys(mutator) {
			keys.current = mutator(keys.current);
		},
	};
}

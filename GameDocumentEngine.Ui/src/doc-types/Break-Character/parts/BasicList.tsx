import type { FormFieldReturnType } from '@/utils/form';
import { IconButton } from '@/components/button/icon-button';
import { HiPlus } from 'react-icons/hi2';
import { useFieldList } from './useFieldList';
import React from 'react';

export function BasicList<T>({
	field: listField,
	defaultValue,
	fieldComponent: Component,
	toKey,
}: {
	field: FormFieldReturnType<T[]>;
	defaultValue: T;
	fieldComponent: React.FC<{
		field: FormFieldReturnType<T>;
		onRemove: () => void;
	}>;
	toKey?: (this: void, item: T) => React.Key;
}) {
	const { length, addItem, removeItem, item, key } = useFieldList(
		listField,
		defaultValue,
		toKey,
	);
	return (
		<>
			{Array(length)
				.fill(0)
				.map((_, index) => (
					<Component
						key={key(index)}
						field={item(index)}
						onRemove={() => removeItem(index)}
					/>
				))}
			<IconButton onClick={addItem}>
				<HiPlus />
			</IconButton>
		</>
	);
}

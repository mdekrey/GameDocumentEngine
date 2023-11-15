import type { FormFieldReturnType } from '@/utils/form';
import { IconButton } from '@/components/button/icon-button';
import { HiPlus } from 'react-icons/hi2';
import { useFieldList } from './useFieldList';
import React from 'react';

export function BasicList<T>({
	field: listField,
	item: _item,
	defaultValue,
	fieldComponent: Component,
}: {
	field: FormFieldReturnType<T[]>;
	item: (index: number) => FormFieldReturnType<T>;
	defaultValue: T;
	fieldComponent: React.FC<{
		field: FormFieldReturnType<T>;
		onRemove: () => void;
	}>;
}) {
	const { length, addItem, removeItem, item } = useFieldList(
		listField,
		_item,
		defaultValue,
	);
	return (
		<>
			{Array(length)
				.fill(0)
				.map((_, index) => (
					<Component
						key={index}
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

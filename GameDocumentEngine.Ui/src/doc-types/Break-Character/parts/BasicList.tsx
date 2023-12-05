import type { FormFieldReturnType } from '@/utils/form';
import { IconButton } from '@/components/button/icon-button';
import { HiMinus, HiPlus } from 'react-icons/hi2';
import { useFieldList } from './useFieldList';
import React from 'react';
import { ButtonRow } from '@/components/button/button-row';
import { twMerge } from 'tailwind-merge';

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

			<ButtonRow>
				<IconButton title={listField.translation('add')} onClick={addItem}>
					<HiPlus />
				</IconButton>
			</ButtonRow>
		</>
	);
}

export const BasicListItem = ({
	children,
	className,
	onRemove,
}: {
	children?: React.ReactNode;
	className?: string;
	onRemove: () => void;
}) => (
	<div className={twMerge('flex flex-row gap-2', className)}>
		{children}
		<div className="mt-8">
			<IconButton.Destructive onClick={onRemove}>
				<HiMinus />
			</IconButton.Destructive>
		</div>
	</div>
);

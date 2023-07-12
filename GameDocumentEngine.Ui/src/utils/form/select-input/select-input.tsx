import { twMerge } from 'tailwind-merge';
import { JotaiSelect } from './JotaiSelect';

export type SelectInputProps<T> = Omit<
	React.ComponentProps<typeof JotaiSelect>,
	'children'
> & {
	items: T[];
	valueSelector: (item: T) => string;
	children: (item: T) => React.ReactNode;
};

export function SelectInput<T>({
	className,
	items,
	valueSelector,
	children,
	...props
}: SelectInputProps<T>) {
	return (
		<JotaiSelect
			className={twMerge('px-2 py-2 border-gray-500 border w-full', className)}
			{...props}
		>
			{items.map((item) => {
				const value = valueSelector(item);
				return (
					<option key={value} value={value}>
						{children(item)}
					</option>
				);
			})}
		</JotaiSelect>
	);
}

import { twMerge } from 'tailwind-merge';
import { JotaiInput } from './JotaiInput';

export function TextInput({
	type = 'text',
	className,
	...props
}: React.ComponentProps<typeof JotaiInput>) {
	return (
		<JotaiInput
			className={twMerge(
				'px-2 py-2 border-gray-500 border w-full',
				'disabled:text-gray-800 disabled:border-gray-300 disabled:bg-gray200',
				className,
			)}
			type={type}
			{...props}
		/>
	);
}

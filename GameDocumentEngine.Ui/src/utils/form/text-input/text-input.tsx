import { twMerge } from 'tailwind-merge';
import { JotaiInput } from '../useField';

export function TextInput({
	type = 'text',
	className,
	...props
}: React.ComponentProps<typeof JotaiInput>) {
	return (
		<JotaiInput
			className={twMerge('px-2 py-2 border-gray-500 border w-full', className)}
			type={type}
			{...props}
		/>
	);
}

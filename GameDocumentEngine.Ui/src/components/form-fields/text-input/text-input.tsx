import { JotaiInput } from '../jotai/input';
import { useTwMerge } from '../jotai/useTwMerge';

export function TextInput({
	type = 'text',
	className,
	...props
}: React.ComponentProps<typeof JotaiInput>) {
	return (
		<JotaiInput
			className={useTwMerge(
				'px-2 py-2 border-gray-500 border w-full',
				'disabled:text-opacity-50 disabled:border-gray-800 disabled:bg-gray-800',
				'bg-slate-900 text-brand-white',
				className,
			)}
			type={type}
			{...props}
		/>
	);
}

import { JotaiTextarea } from '../jotai/textarea';
import { useTwMerge } from '../jotai/useTwMerge';

export function TextareaInput({
	className,
	...props
}: React.ComponentProps<typeof JotaiTextarea>) {
	return (
		<JotaiTextarea
			className={useTwMerge(
				'px-2 py-2 border-gray-500 border w-full',
				'disabled:text-gray-800 disabled:border-gray-300 disabled:bg-gray200',
				className,
			)}
			{...props}
		/>
	);
}

import { JotaiTextarea } from '../../jotai/textarea';
import { useTwMerge } from '../../jotai/useTwMerge';

export function TextareaInput({
	className,
	...props
}: React.ComponentProps<typeof JotaiTextarea>) {
	return (
		<JotaiTextarea
			className={useTwMerge(
				'px-2 py-2 border-slate-500 border w-full',
				'disabled:text-opacity-50 disabled:border-slate-800 disabled:bg-slate-800',
				'bg-slate-900 text-white',
				className,
			)}
			{...props}
		/>
	);
}

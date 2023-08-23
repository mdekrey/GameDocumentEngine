import { JotaiInput } from '../../jotai/input';
import { useTwMerge } from '../../jotai/useTwMerge';

export function TextInput({
	type = 'text',
	className,
	...props
}: React.ComponentProps<typeof JotaiInput>) {
	return (
		<JotaiInput
			className={useTwMerge(
				'px-2 py-2 w-full',
				'border-slate-500 border',
				'disabled:text-opacity-75 disabled:border-slate-200 dark:disabled:border-slate-800 disabled:bg-slate-500/10',
				'bg-transparent text-slate-950 dark:text-slate-50',
				'outline-none ring-2 ring-offset-transparent ring-offset-2 ring-transparent focus:ring-blue-500 transition-all',
				className,
			)}
			type={type}
			{...props}
		/>
	);
}

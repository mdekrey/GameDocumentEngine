import { isAtom, useComputedAtom } from '@principlestudios/jotai-react-signals';
import { JotaiInput } from '../../jotai/input';
import { useTwMerge } from '../../jotai/useTwMerge';

export function TextInput({
	type = 'text',
	className,
	readOnly,
	...props
}: React.ComponentProps<typeof JotaiInput>) {
	return (
		<JotaiInput
			className={useTwMerge(
				'px-2 py-2 w-full',
				'border',
				useComputedAtom((get) =>
					(isAtom(readOnly) ? get(readOnly) : readOnly)
						? 'border-transparent'
						: 'border-slate-500 disabled:border-slate-200 dark:disabled:border-slate-800',
				),
				useComputedAtom((get) =>
					(isAtom(readOnly) ? get(readOnly) : readOnly)
						? 'bg-transparent'
						: 'bg-transparent disabled:bg-slate-500/10',
				),
				'disabled:text-opacity-75',
				'text-slate-950 dark:text-slate-50',
				'outline-none ring-2 ring-offset-transparent ring-offset-2 ring-transparent focus:ring-blue-500 transition-all',
				className,
			)}
			type={type}
			readOnly={readOnly}
			{...props}
		/>
	);
}

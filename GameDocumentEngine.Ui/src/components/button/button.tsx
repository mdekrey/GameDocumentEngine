import { twMerge } from 'tailwind-merge';

export function Button({
	children,
	className,
	type,
	disabled,
	...props
}: JSX.IntrinsicElements['button']) {
	return (
		<button
			className={twMerge(
				'px-4 py-2 bg-slate-800 text-white font-bold focus:bg-slate-700 hover:bg-slate-700 outline-blue-700 transition-colors',
				disabled && 'opacity-20',
				className,
			)}
			type={type ?? 'button'}
			{...props}
		>
			{children}
		</button>
	);
}

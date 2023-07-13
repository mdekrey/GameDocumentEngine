import { twMerge } from 'tailwind-merge';
import { buttonThemes } from './buttonThemes';

export function IconButtonComponent({
	children,
	className,
	type,
	disabled,
	...props
}: JSX.IntrinsicElements['button']) {
	return (
		<button
			className={twMerge(
				'p-1 text-xl rounded-full flex items-center bg-slate-800 text-white font-bold focus:bg-slate-700 hover:bg-slate-700 outline-blue-700 transition-colors',
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

export const IconButton = Object.assign(
	IconButtonComponent,
	buttonThemes('Button', IconButtonComponent),
);

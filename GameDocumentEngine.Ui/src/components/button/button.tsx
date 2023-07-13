import { twMerge } from 'tailwind-merge';
import { buttonThemes } from './buttonThemes';

function ButtonComponent({
	children,
	className,
	type,
	disabled,
	...props
}: JSX.IntrinsicElements['button']) {
	return (
		<button
			className={twMerge(
				'bg-slate-800 text-white focus:bg-slate-700 hover:bg-slate-700 outline-blue-700',
				'px-3 py-2 rounded-md',
				'w-full sm:w-auto',
				'inline-flex items-center justify-center',
				'text-sm font-semibold',
				'transition-colors shadow-sm',
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

export const Button = Object.assign(
	ButtonComponent,
	buttonThemes('Button', ButtonComponent),
);

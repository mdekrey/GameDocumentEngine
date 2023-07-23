import { twMerge } from 'tailwind-merge';
import { buttonThemes, iconButtonClasses } from './buttonThemes';

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
				iconButtonClasses,
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

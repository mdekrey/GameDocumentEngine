import { twMerge } from 'tailwind-merge';
import { buttonClasses, buttonThemes } from './buttonThemes';

function ButtonComponent({
	children,
	className,
	type,
	disabled,
	...props
}: JSX.IntrinsicElements['button']) {
	return (
		<button
			className={twMerge(buttonClasses, disabled && 'opacity-20', className)}
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

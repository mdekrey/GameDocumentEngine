import { twMerge } from 'tailwind-merge';
import { iconButtonClasses, buttonThemes } from './buttonThemes';
import { Link, LinkProps } from 'react-router-dom';

export function IconLinkButtonComponent({
	children,
	className,
	type,
	...props
}: LinkProps) {
	return (
		<Link
			className={twMerge(iconButtonClasses, className)}
			type={type ?? 'button'}
			{...props}
		>
			{children}
		</Link>
	);
}

export const IconLinkButton = Object.assign(
	IconLinkButtonComponent,
	buttonThemes('Button', IconLinkButtonComponent),
);

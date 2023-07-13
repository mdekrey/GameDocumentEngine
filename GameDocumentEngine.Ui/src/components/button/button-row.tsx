import { twMerge } from 'tailwind-merge';

export function ButtonRow({
	className,
	children,
	...props
}: JSX.IntrinsicElements['div']) {
	return (
		<div
			className={twMerge('col-span-2 flex flex-row-reverse gap-2', className)}
			{...props}
		>
			{children}
		</div>
	);
}

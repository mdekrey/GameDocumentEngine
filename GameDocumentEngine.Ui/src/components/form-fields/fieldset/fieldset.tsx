import { twMerge } from 'tailwind-merge';

export function Fieldset({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={twMerge(
				'max-w-screen-sm flex flex-col gap-2 text-left',
				className,
			)}
		>
			{children}
		</div>
	);
}

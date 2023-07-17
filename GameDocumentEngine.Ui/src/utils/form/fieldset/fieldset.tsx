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
				'm-auto max-w-screen-sm flex flex-col md:grid md:grid-cols-[minmax(auto,20%)_1fr] gap-2',
				className,
			)}
		>
			{children}
		</div>
	);
}

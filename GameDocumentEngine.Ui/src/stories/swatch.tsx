import { twMerge } from 'tailwind-merge';
import { allColorNames, colors } from './tailwind-info';

export function Swatches() {
	return (
		<div className="sb-unstyled">
			{allColorNames.map((color) => (
				<Swatch color={color} key={color} className="m-2" />
			))}
		</div>
	);
}

export function Swatch({
	className,
	color,
}: {
	className?: string;
	color: string;
}) {
	return (
		<div
			className={twMerge('inline-flex flex-col gap-1 items-center', className)}
		>
			<div
				className={twMerge('w-20 h-20 inline-block border border-black')}
				style={{ backgroundColor: colors[color] }}
			/>
			<span className="text-xs">{color}</span>
			<span className="text-xs">{colors[color]}</span>
		</div>
	);
}

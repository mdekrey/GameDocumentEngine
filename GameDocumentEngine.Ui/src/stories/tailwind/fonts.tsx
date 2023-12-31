import { twMerge } from 'tailwind-merge';
import { fontSizes, fontFamilies } from './info';

export function FontSizes() {
	return (
		<div className="sb-unstyled">
			{Object.entries(fontSizes).map(([sizeName, sizeAttributes]) => (
				<FontDemo
					fontName={sizeName}
					fontValue={sizeAttributes}
					key={sizeName}
					className="m-2"
				/>
			))}
		</div>
	);
}

export function FontFamilies() {
	return (
		<div className="sb-unstyled">
			{Object.entries(fontFamilies).map(([familyName, family]) => (
				<FontDemo
					fontName={familyName}
					fontValue={{
						fontFamily: Array.isArray(family) ? family.join(', ') : family,
					}}
					key={familyName}
					className="m-2"
				/>
			))}
		</div>
	);
}

export function FontDemo({
	className,
	fontName,
	fontValue,
}: {
	className?: string;
	fontName: string;
	fontValue: React.CSSProperties;
}) {
	return (
		<div className={twMerge('flex flex-col gap-1', className)}>
			<p style={fontValue}>The quick brown fox jumped over the lazy dog.</p>
			<span className="text-xs">{fontName}</span>
			<span className="text-xs">{JSON.stringify(fontValue)}</span>
		</div>
	);
}

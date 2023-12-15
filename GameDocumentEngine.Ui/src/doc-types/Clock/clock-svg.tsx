import { useMemo } from 'react';
import type { PieArcDatum } from 'd3-shape';
import { arc, pie } from 'd3-shape';
import { useTranslation } from 'react-i18next';

export function ClockSvg({
	className,
	radius,
	padding,
	currentTicks,
	totalTicks,
	...props
}: {
	className?: string;
	radius: number;
	padding: number;
	currentTicks: number;
	totalTicks: number;
} & JSX.IntrinsicElements['svg']) {
	const { t } = useTranslation('doc-types:Clock', { keyPrefix: 'view-clock' });
	const clockArc = useMemo(
		() => arc<void, PieArcDatum<unknown>>().innerRadius(0).outerRadius(radius),
		[radius],
	);
	const clockPie = useMemo(() => {
		const clockPieData = Array(totalTicks).fill(1) as 1[];
		return pie<void, number>()(clockPieData);
	}, [totalTicks]);

	return (
		<svg
			className={className}
			viewBox={`0 0 ${radius * 2 + padding} ${radius * 2 + padding}`}
			{...props}
		>
			<title>
				{t('clock-title', { current: currentTicks, max: totalTicks })}
			</title>
			<g
				transform={`translate(${padding / 2 + radius} ${padding / 2 + radius})`}
			>
				{clockPie.map((piece) => (
					<path
						key={piece.index}
						d={clockArc(piece) as string}
						fill="currentcolor"
						stroke="black"
						strokeWidth={Math.min(
							padding / 2,
							totalTicks <= 8 ? 2 : totalTicks <= 20 ? 1 : 0.5,
						)}
						className={
							piece.index < currentTicks ? 'text-slate-700' : 'text-slate-50'
						}
					/>
				))}
			</g>
		</svg>
	);
}

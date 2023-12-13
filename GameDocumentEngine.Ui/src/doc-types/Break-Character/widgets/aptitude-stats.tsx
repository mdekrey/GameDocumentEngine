import type {
	GameObjectComponentBase,
	GameObjectWidgetDefinition,
} from '@/documents/defineDocument';
import type { Character } from '../character-types';
import { elementTemplate } from '@/components/template';
import { ErrorScreen } from '@/components/errors';
import type { TFunction } from 'i18next';
import aptitudeColors from '../aptitude-colors.module.css';
import { useId } from 'react';

const AptitudeValue = elementTemplate('AptitudeValue', 'span', (T) => (
	<T className="text-right font-bold" />
));
const AptitudeName = elementTemplate('AptitudeName', 'span', (T) => (
	<T className="text-left uppercase" />
));
const AptitudeBar = elementTemplate('AptitudeBar', GradientSvg, (T) => (
	<T className="h-3 w-full bg-slate-300 dark:bg-slate-700" />
));

type Aptitudes = Character['aptitudes'];
function AptitudeStat({
	aptitudes,
	t,
	name,
}: {
	aptitudes: Aptitudes;
	t: TFunction;
	name: keyof Aptitudes;
}) {
	const min = Math.max(
		0,
		Math.min(5, ...Object.values(aptitudes).map((a) => a.total - 2)),
	);
	const largestTotal = Math.max(
		...Object.values(aptitudes).map((a) => a.total),
	);
	const thisTotal = aptitudes[name].total;
	return (
		<>
			<AptitudeValue>{thisTotal.toFixed(0)}</AptitudeValue>
			<AptitudeName>{t(`aptitudes.${name}`)}</AptitudeName>
			<AptitudeBar
				className={aptitudeColors[name]}
				fraction={(thisTotal - min) / (largestTotal - min)}
			/>
		</>
	);
}

export function AptitudeStats({
	document,
	translation: t,
}: GameObjectComponentBase<Character>) {
	if (!document.details.aptitudes) {
		return <ErrorScreen.NoAccess.Sized size="widget" />;
	}
	const props = {
		aptitudes: document.details.aptitudes,
		t,
	};
	return (
		<div className="grid gap-x-2 grid-cols-[auto,1fr,1fr] grid-rows-5 h-full w-full text-xs items-center">
			<AptitudeStat {...props} name="might" />
			<AptitudeStat {...props} name="deftness" />
			<AptitudeStat {...props} name="grit" />
			<AptitudeStat {...props} name="insight" />
			<AptitudeStat {...props} name="aura" />
		</div>
	);
}

function GradientSvg({
	className,
	fraction,
}: {
	className?: string;
	fraction: number;
}) {
	const gradientId = useId();

	return (
		<svg
			viewBox={`0 0 100 100`}
			className={className}
			preserveAspectRatio="none"
		>
			<defs>
				<linearGradient id={gradientId}>
					<stop className={aptitudeColors.stop1} offset="0%" />
					<stop className={aptitudeColors.stop2} offset="100%" />
				</linearGradient>
			</defs>
			<rect
				x={0}
				y={0}
				height={100}
				width={100 * fraction}
				className="transition-all"
				fill={`url(#${gradientId})`}
			/>
		</svg>
	);
}

export const AptitudeStatsWidgetDefinition: GameObjectWidgetDefinition<
	Character,
	void
> = {
	component: AptitudeStats,
	defaults: { width: 10, height: 5 },
	translationKeyPrefix: 'widgets.AptitudeStats',
	getConstraints() {
		return { min: { width: 6, height: 5 } };
	},
	settingsComponent: undefined,
	defaultSettings: {},
};

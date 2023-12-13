import '@/utils/api/queries';
import type {
	GameObjectWidgetDefinition,
	WidgetComponentProps,
} from '@/documents/defineDocument';
import { ClockSvg } from '../clock-svg';
import type { Clock } from '../clock-types';

export function ClockDisplay({
	document,
	size,
}: WidgetComponentProps<Clock, void>) {
	const radius = Math.min(size.width, size.height);
	return (
		<ClockSvg
			className="self-center mx-auto"
			currentTicks={document.details.current}
			totalTicks={document.details.max}
			padding={0.2}
			radius={radius}
			width="100%"
			height="100%"
		/>
	);
}

export const ClockDisplayWidgetDefinition: GameObjectWidgetDefinition<
	Clock,
	void
> = {
	component: ClockDisplay,
	defaults: { width: 10, height: 10 },
	translationKeyPrefix: '',
	getConstraints() {
		return { min: { width: 1, height: 1 } };
	},
	defaultSettings: {},
	settingsComponent: undefined,
};

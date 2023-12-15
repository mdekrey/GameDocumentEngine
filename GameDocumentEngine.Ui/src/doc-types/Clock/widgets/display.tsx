import '@/utils/api/queries';
import type { WidgetComponentProps } from '@/documents/defineDocument';
import { ClockSvg } from '../clock-svg';
import type { Clock } from '../clock-types';

export function ClockDisplay({ document }: WidgetComponentProps<Clock>) {
	return (
		<ClockSvg
			className="self-center mx-auto"
			currentTicks={document.details.current}
			totalTicks={document.details.max}
			padding={2}
			radius={70}
			width="100%"
			height="100%"
		/>
	);
}

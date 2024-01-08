import type { Widget } from './types';
import { LimitingInset } from './Inset';
import { useWidget } from './useWidget';

export function RenderWidget({
	gameId,
	widgetConfig,
}: {
	gameId: string;
	widgetConfig: Widget;
}) {
	const Widget = useWidget(gameId, widgetConfig);
	return (
		<LimitingInset>
			<Widget />
		</LimitingInset>
	);
}

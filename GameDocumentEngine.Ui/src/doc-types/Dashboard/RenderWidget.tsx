import type { Widget } from './types';
import { useDocument, useWidgetType } from '@/utils/api/hooks';
import { LimitingInset } from './Inset';

export function RenderWidget({
	gameId,
	widgetConfig,
}: {
	gameId: string;
	widgetConfig: Widget;
}) {
	const document = useDocument(gameId, widgetConfig.documentId);
	const { component: Component } = useWidgetType(
		gameId,
		widgetConfig.documentId,
		widgetConfig.widget,
	);

	return (
		<LimitingInset>
			<Component
				document={document}
				widgetType={widgetConfig.widget}
				size={widgetConfig.position}
				widgetSettings={widgetConfig.settings}
			/>
		</LimitingInset>
	);
}

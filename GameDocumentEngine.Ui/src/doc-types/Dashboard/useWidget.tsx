import type { Widget } from './types';
import { useDocument, useWidgetType } from '@/utils/api/hooks';
import { useCallback } from 'react';

export function useWidget(gameId: string, widgetConfig: Widget) {
	const document = useDocument(gameId, widgetConfig.documentId);
	const { component: Component } = useWidgetType(
		gameId,
		widgetConfig.documentId,
		widgetConfig.widget,
	);
	return useCallback(
		function Widget() {
			return (
				<Component
					document={document}
					widgetType={widgetConfig.widget}
					size={widgetConfig.position}
					widgetSettings={widgetConfig.settings}
				/>
			);
		},
		[Component, document, widgetConfig],
	);
}

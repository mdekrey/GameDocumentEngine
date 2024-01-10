import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { Widget } from './types';
import { useWidgetType } from '@/utils/api/hooks';
import { useCallback } from 'react';

export function useWidget(
	previewDocument: DocumentDetails,
	widgetConfig: Widget,
) {
	const { component: Component } = useWidgetType(
		previewDocument.gameId,
		previewDocument.id,
		widgetConfig.widget,
	);
	return useCallback(
		function Widget() {
			return (
				<Component
					document={previewDocument}
					widgetType={widgetConfig.widget}
					size={widgetConfig.position}
					widgetSettings={widgetConfig.settings}
				/>
			);
		},
		[Component, previewDocument, widgetConfig],
	);
}

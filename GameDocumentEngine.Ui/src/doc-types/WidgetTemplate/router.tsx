import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { WidgetTemplate } from './types';
import { Route, Routes } from 'react-router-dom';
import { SelectPreviewItem } from './select-preview-item';
import { WidgetSettings } from './widget-settings';
import { withParamsValue } from '@/components/router/withParamsValue';
import { MainDisplay } from './main';

const withPreviewDocumentId = withParamsValue('previewDocumentId');
const withWidgetId = withParamsValue('widgetId');

const InternalMainDisplay = withPreviewDocumentId(MainDisplay);
const InternalWidgetSettings = withPreviewDocumentId(
	withWidgetId(WidgetSettings),
);

export function WidgetTemplateRouter(
	props: GameObjectFormComponent<WidgetTemplate>,
) {
	return (
		<Routes>
			<Route
				path="/preview/:previewDocumentId"
				element={<InternalMainDisplay {...props} />}
			/>
			<Route
				path="widget/:widgetId/preview/:previewDocumentId"
				element={<InternalWidgetSettings {...props} />}
			/>
			<Route path="" element={<SelectPreviewItem {...props} />} />
		</Routes>
	);
}

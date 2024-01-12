import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { WidgetTemplate } from './types';
import { Route, Routes } from 'react-router-dom';
import { SelectPreviewItem } from './select-preview-item';
import { WidgetSettings } from './widget-settings';
import { withParamsValue } from '@/components/router/withParamsValue';
import { WidgetTemplateEditMode, WidgetTemplateViewMode } from './main';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';

const withPreviewDocumentId = withParamsValue('previewDocumentId');
const withWidgetId = withParamsValue('widgetId');

const InternalEditMode = withPreviewDocumentId(WidgetTemplateEditMode);
const InternalViewMode = withPreviewDocumentId(WidgetTemplateViewMode);
const InternalWidgetSettings = withPreviewDocumentId(
	withWidgetId(WidgetSettings),
);

export function WidgetTemplateRouter(
	props: GameObjectFormComponent<WidgetTemplate>,
) {
	const canUpdateWidgets = props.writablePointers.contains(
		'details',
		'widgets',
	);
	useSubmitOnChange(props.form, props.onSubmit);
	return (
		<Routes>
			<Route
				path="/preview/:previewDocumentId"
				element={
					canUpdateWidgets ? (
						<InternalEditMode {...props} />
					) : (
						<InternalViewMode {...props} />
					)
				}
			/>
			<Route
				path="/preview/:previewDocumentId/widget/:widgetId"
				element={<InternalWidgetSettings {...props} />}
			/>
			<Route path="" element={<SelectPreviewItem {...props} />} />
		</Routes>
	);
}

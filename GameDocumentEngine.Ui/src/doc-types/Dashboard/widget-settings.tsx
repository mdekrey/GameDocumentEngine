import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { Dashboard } from './types';
import { Navigate, useNavigate } from 'react-router-dom';
import { produce } from 'immer';
import {
	useDocument,
	useTranslationFor,
	useWidgetType,
} from '@/utils/api/hooks';
import { useWidget } from './useWidget';
import { WidgetSettingsForm } from './WidgetSettingsForm';

export function WidgetSettingsContainer({
	widgetId,
	document: dashboardDocument,
	onSubmit,
	form,
}: GameObjectFormComponent<Dashboard> & { widgetId: string }) {
	const widget = dashboardDocument.details.widgets[widgetId];
	const document = useDocument(dashboardDocument.gameId, widget.documentId);
	const widgetDefinition = useWidgetType(
		dashboardDocument.gameId,
		widget.documentId,
		widget.widget,
	);
	const navigate = useNavigate();
	const translation = useTranslationFor(
		document.gameId,
		document.id,
		widget.widget,
	);
	const Widget = useWidget(document.gameId, widget);

	if (!widgetDefinition.settings) return <Navigate to="../" />;

	return (
		<WidgetSettingsForm
			document={document}
			widgetDefinition={widgetDefinition}
			translation={translation}
			WidgetPreview={Widget}
			initialSettings={widget.settings}
			position={widget.position}
			onSubmit={(widgetValue, newSize) => {
				navigate('../');
				void onSubmit(
					produce(form.get(), (v) => {
						const widget = v.details.widgets[widgetId];
						widget.settings = widgetValue;
						widget.position.width = newSize.width;
						widget.position.height = newSize.height;
					}),
				);
			}}
		/>
	);
}

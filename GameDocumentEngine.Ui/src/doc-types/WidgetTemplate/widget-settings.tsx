import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { WidgetTemplate } from './types';
import type { WidgetSettings } from '@/documents/defineDocument';
import { Navigate, useNavigate } from 'react-router-dom';
import { produce } from 'immer';
import {
	useDocument,
	useTranslationFor,
	useWidgetType,
} from '@/utils/api/hooks';
import { useWidget } from './useWidget';
import { WidgetSettingsForm } from '@/doc-types/Dashboard/WidgetSettingsForm';

export function WidgetSettings({
	widgetId,
	document: widgetTemplateDocument,
	onSubmit,
	form,
	previewDocumentId,
}: GameObjectFormComponent<WidgetTemplate> & {
	widgetId: string;
	previewDocumentId: string;
}) {
	const widget = widgetTemplateDocument.details.widgets[widgetId];
	const document = useDocument(
		widgetTemplateDocument.gameId,
		previewDocumentId,
	);
	const widgetDefinition = useWidgetType(
		widgetTemplateDocument.gameId,
		previewDocumentId,
		widget.widget,
	);
	const navigate = useNavigate();

	const translation = useTranslationFor(
		document.gameId,
		document.id,
		widget.widget,
	);
	const Widget = useWidget(document.gameId, widget, document);
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

import type {
	WidgetSettings,
	WidgetBase,
	WidgetComponentProps,
} from '@/documents/defineDocument';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { Widget } from './types';

export function RenderWidgetContents<T, TWidget extends WidgetBase>({
	component: Component,
	document,
	widgetType,
	widgetConfig,
}: {
	component: React.ComponentType<WidgetComponentProps<T, TWidget>>;
	document: DocumentDetails;
	widgetType: string;
	widgetConfig: Widget<TWidget>;
}) {
	return (
		<Component
			document={document}
			size={widgetConfig.position}
			widgetType={widgetType}
			widgetSettings={widgetConfig.settings as WidgetSettings<TWidget>}
		/>
	);
}

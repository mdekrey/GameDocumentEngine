import { useTranslation } from 'react-i18next';
import type { RenderWidgetContentsProps } from './RenderWidgetContentsProps';
import type { WidgetBase, WidgetSettings } from '@/documents/defineDocument';

export function RenderWidgetContents<T, TWidget extends WidgetBase>({
	component: Component,
	document,
	translationNamespace,
	translationKeyPrefix,
	widgetConfig,
}: RenderWidgetContentsProps<T, TWidget>) {
	const { t: fullTranslation } = useTranslation(
		translationNamespace ?? `doc-types:${document.type}`,
		{
			keyPrefix: translationKeyPrefix,
		},
	);
	return (
		<Component
			document={document}
			translation={fullTranslation}
			size={widgetConfig.position}
			widgetSettings={widgetConfig.settings as WidgetSettings<TWidget>}
		/>
	);
}

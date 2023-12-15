import { useTranslation } from 'react-i18next';
import type { RenderWidgetContentsProps } from './RenderWidgetContentsProps';
import type { WidgetBase, WidgetSettings } from '@/documents/defineDocument';

export function RenderWidgetContents<T, TWidget extends WidgetBase>({
	component: Component,
	document,
	user,
	translationNamespace,
	translationKeyPrefix,
	gameType,
	docType,
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
			user={user}
			translation={fullTranslation}
			gameType={gameType}
			docType={docType}
			size={widgetConfig.position}
			widgetSettings={widgetConfig.settings as WidgetSettings<TWidget>}
		/>
	);
}

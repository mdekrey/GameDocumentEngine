import { useTranslation } from 'react-i18next';
import type { RenderWidgetContentsProps } from './RenderWidgetContentsProps';

export function RenderWidgetContents({
	component: Component,
	document,
	user,
	translationNamespace,
	translationKeyPrefix,
	gameType,
	docType,
}: RenderWidgetContentsProps) {
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
		/>
	);
}

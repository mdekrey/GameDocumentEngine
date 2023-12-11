import { useTranslation } from 'react-i18next';
import type { RenderWidgetContentsProps } from './RenderWidgetContentsProps';

export function RenderWidgetContents({
	component: Component,
	document,
	user,
	translationKeyPrefix,
}: RenderWidgetContentsProps) {
	const { t: fullTranslation } = useTranslation(`doc-types:${document.type}`, {
		keyPrefix: translationKeyPrefix,
	});
	return (
		<Component document={document} user={user} translation={fullTranslation} />
	);
}

import { useTranslation } from 'react-i18next';
import type { RenderWidgetContentsProps } from './RenderWidgetContentsProps';

export function RenderWidgetContents({
	component: Component,
	document,
	user,
}: RenderWidgetContentsProps) {
	const { t: fullTranslation } = useTranslation(document.type);
	return (
		<Component document={document} user={user} translation={fullTranslation} />
	);
}

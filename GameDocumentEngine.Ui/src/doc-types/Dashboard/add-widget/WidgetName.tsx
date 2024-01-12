import { useTranslation } from 'react-i18next';
import type { GameObjectWidgetDefinition } from '@/documents/defineDocument';
import { getDocTypeTranslationNamespace } from '@/utils/api/accessors';

export function WidgetName({
	target,
	docTypeKey,
}: {
	target: GameObjectWidgetDefinition<unknown, void>;
	docTypeKey: string;
}) {
	const { t } = useTranslation(
		target.translationNamespace ?? getDocTypeTranslationNamespace(docTypeKey),
		{
			keyPrefix: target.translationKeyPrefix,
		},
	);

	return <>{t('name')}</>;
}

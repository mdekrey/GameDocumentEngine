import { useQuery } from '@tanstack/react-query';
import { queries } from '@/utils/api/queries';
import { ErrorScreen } from '@/components/errors/ErrorScreen';
import { useTranslation } from 'react-i18next';
import type { UserDetails } from '@/api/models/UserDetails';
import { RenderWidgetContents } from './RenderWidgetContents';
import { elementTemplate } from '@/components/template';
import { ErrorBoundary } from '@/components/error-boundary/error-boundary';
import type { GameTypeScripts } from '@/utils/api/queries/game-types';
import type { Widget } from './types';

const WidgetInnerWrapper = elementTemplate('WidgetContents', 'div', (T) => (
	<T className="absolute inset-0 overflow-hidden" />
));

export function RenderWidget({
	gameType,
	gameId,
	user,
	widgetConfig,
}: {
	gameType: GameTypeScripts;
	gameId: string;
	user: UserDetails;
	widgetConfig: Widget;
}) {
	const { t } = useTranslation('doc-types:Dashboard', {
		keyPrefix: 'widgets',
	});
	const document = useQuery(
		queries.getDocument(gameId, widgetConfig.documentId),
	);

	if (document.isLoading)
		return <WidgetInnerWrapper className="bg-slate-500" />;
	const docType = gameType.objectTypes[document.data?.type ?? ''];
	const docWidgetDefinition = docType?.typeInfo.widgets?.[widgetConfig.widget];
	if (document.isError || !docType || !docWidgetDefinition)
		return (
			<WidgetInnerWrapper className="border-4 border-red-800">
				<ErrorScreen message={t('widget-load-error')} />
			</WidgetInnerWrapper>
		);

	return (
		<WidgetInnerWrapper>
			<ErrorBoundary
				fallback={<ErrorScreen message={t('widget-runtime-error')} />}
			>
				<RenderWidgetContents
					component={docWidgetDefinition.component}
					translationNamespace={docWidgetDefinition.translationNamespace}
					translationKeyPrefix={docWidgetDefinition.translationKeyPrefix}
					document={document.data}
					gameType={gameType}
					docType={docType}
					user={user}
					widgetConfig={widgetConfig}
				/>
			</ErrorBoundary>
		</WidgetInnerWrapper>
	);
}

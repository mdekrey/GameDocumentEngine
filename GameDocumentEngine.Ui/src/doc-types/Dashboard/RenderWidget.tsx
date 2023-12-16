import { ErrorScreen } from '@/components/errors/ErrorScreen';
import { useTranslation } from 'react-i18next';
import type { UserDetails } from '@/api/models/UserDetails';
import { RenderWidgetContents } from './RenderWidgetContents';
import { elementTemplate } from '@/components/template';
import { ErrorBoundary } from '@/components/error-boundary/error-boundary';
import type { GameTypeScripts } from '@/utils/api/queries/game-types';
import type { Widget } from './types';
import { useDocument, useDocumentType, useWidgetType } from '@/utils/api/hooks';

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
	const document = useDocument(gameId, widgetConfig.documentId);
	const docType = useDocumentType(gameId, widgetConfig.documentId);
	const docWidgetDefinition = useWidgetType(
		gameId,
		widgetConfig.documentId,
		widgetConfig.widget,
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
					document={document}
					gameType={gameType}
					docType={docType}
					user={user}
					widgetConfig={widgetConfig}
				/>
			</ErrorBoundary>
		</WidgetInnerWrapper>
	);
}

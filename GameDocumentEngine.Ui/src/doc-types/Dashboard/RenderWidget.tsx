import { ErrorScreen } from '@/components/errors/ErrorScreen';
import { useTranslation } from 'react-i18next';
import { RenderWidgetContents } from './RenderWidgetContents';
import { ErrorBoundary } from '@/components/error-boundary/error-boundary';
import type { Widget } from './types';
import {
	useCurrentUser,
	useDocument,
	useDocumentType,
	useGameType,
	useWidgetType,
} from '@/utils/api/hooks';
import { LimitingInset } from './Inset';

export function RenderWidget({
	gameId,
	widgetConfig,
}: {
	gameId: string;
	widgetConfig: Widget;
}) {
	const { t } = useTranslation('doc-types:Dashboard', {
		keyPrefix: 'widgets',
	});
	const user = useCurrentUser();
	const gameType = useGameType(gameId);
	const document = useDocument(gameId, widgetConfig.documentId);
	const docType = useDocumentType(gameId, widgetConfig.documentId);
	const docWidgetDefinition = useWidgetType(
		gameId,
		widgetConfig.documentId,
		widgetConfig.widget,
	);

	return (
		<LimitingInset>
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
		</LimitingInset>
	);
}

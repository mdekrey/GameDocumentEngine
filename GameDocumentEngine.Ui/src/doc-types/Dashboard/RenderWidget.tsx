import { ErrorScreen } from '@/components/errors/ErrorScreen';
import { useTranslation } from 'react-i18next';
import { RenderWidgetContents } from './RenderWidgetContents';
import { ErrorBoundary } from '@/components/error-boundary/error-boundary';
import type { Widget } from './types';
import { useDocument, useWidgetType } from '@/utils/api/hooks';
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
	const document = useDocument(gameId, widgetConfig.documentId);
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
					document={document}
					widgetType={widgetConfig.widget}
					widgetConfig={widgetConfig}
				/>
			</ErrorBoundary>
		</LimitingInset>
	);
}

import { ErrorScreen } from '@/components/errors/ErrorScreen';
import { RenderWidgetContents } from './RenderWidgetContents';
import { ErrorBoundary } from '@/components/error-boundary/error-boundary';
import type { Widget } from './types';
import {
	useDocTypeTranslation,
	useDocument,
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
	const t = useDocTypeTranslation('Dashboard');
	const document = useDocument(gameId, widgetConfig.documentId);
	const docWidgetDefinition = useWidgetType(
		gameId,
		widgetConfig.documentId,
		widgetConfig.widget,
	);

	return (
		<LimitingInset>
			<ErrorBoundary
				fallback={<ErrorScreen message={t('widgets.widget-runtime-error')} />}
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

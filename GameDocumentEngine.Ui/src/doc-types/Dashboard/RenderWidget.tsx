import { useQuery } from '@tanstack/react-query';
import { queries } from '@/utils/api/queries';
import { ErrorScreen } from '@/components/errors/ErrorScreen';
import { useTranslation } from 'react-i18next';
import type { UserDetails } from '@/api/models/UserDetails';
import { RenderWidgetContents } from './RenderWidgetContents';
import { elementTemplate } from '@/components/template';
import { ErrorBoundary } from '@/components/error-boundary/error-boundary';
import type { GameTypeScripts } from '@/utils/api/queries/game-types';

const WidgetInnerWrapper = elementTemplate('WidgetContents', 'div', (T) => (
	<T className="absolute inset-0 overflow-hidden" />
));

export function RenderWidget({
	gameType,
	gameId,
	documentId,
	widget,
	user,
}: {
	gameType: GameTypeScripts;
	documentId: string;
	widget: string;
	gameId: string;
	user: UserDetails;
}) {
	const { t } = useTranslation('doc-types:Dashboard', {
		keyPrefix: 'widgets',
	});
	const document = useQuery(queries.getDocument(gameId, documentId));

	if (document.isLoading)
		return <WidgetInnerWrapper className="bg-slate-500" />;
	const docType = gameType.objectTypes[document.data?.type ?? ''];
	const docWidgetConfig = docType?.typeInfo.widgets?.[widget];
	if (document.isError || !docType || !docWidgetConfig)
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
					component={docWidgetConfig.component}
					translationNamespace={docWidgetConfig.translationNamespace}
					translationKeyPrefix={docWidgetConfig.translationKeyPrefix}
					document={document.data}
					gameType={gameType}
					docType={docType}
					user={user}
				/>
			</ErrorBoundary>
		</WidgetInnerWrapper>
	);
}

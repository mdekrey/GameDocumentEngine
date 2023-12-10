import type { Widget } from './types';
import { useQuery } from '@tanstack/react-query';
import { useGameType } from '@/apps/documents/useGameType';
import { queries } from '@/utils/api/queries';
import { ErrorScreen } from '@/components/errors/ErrorScreen';
import { useTranslation } from 'react-i18next';
import { useRealtimeApi } from '@/utils/api/realtime-api';
import type { UserDetails } from '@/api/models/UserDetails';
import { WidgetContainer } from './grid-utils';
import type { RenderWidgetContentsProps } from './RenderWidgetContentsProps';
import { RenderWidgetContents } from './RenderWidgetContents';

export function RenderWidget({
	position,
	gameId,
	documentId,
	widget,
	widgetContents: WidgetContents = RenderWidgetContents,
}: Widget & {
	gameId: string;
	user: UserDetails;
	widgetContents?: React.FC<RenderWidgetContentsProps>;
}) {
	const { t } = useTranslation('doc-types:Dashboard', {
		keyPrefix: 'widgets',
	});
	const gameType = useGameType(gameId);
	const document = useQuery(queries.getDocument(gameId, documentId));
	const user = useQuery(queries.getCurrentUser(useRealtimeApi()));

	if (document.isLoading || gameType.isLoading || user.isLoading)
		return <WidgetContainer className="bg-slate-500" position={position} />;
	const docWidgetConfig =
		gameType.data?.objectTypes[document.data?.type ?? ''].typeInfo.widgets?.[
			widget
		];
	if (document.isError || gameType.isError || user.isError || !docWidgetConfig)
		return (
			<WidgetContainer position={position} className="border-4 border-red-800">
				<ErrorScreen message={t('widget-load-error')} />
			</WidgetContainer>
		);

	return (
		<WidgetContainer position={position}>
			<WidgetContents
				component={docWidgetConfig.component}
				document={document.data}
				user={user.data}
			/>
		</WidgetContainer>
	);
}

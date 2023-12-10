import { useQuery } from '@tanstack/react-query';
import { useGameType } from '@/apps/documents/useGameType';
import { queries } from '@/utils/api/queries';
import { ErrorScreen } from '@/components/errors/ErrorScreen';
import { useTranslation } from 'react-i18next';
import type { UserDetails } from '@/api/models/UserDetails';
import { RenderWidgetContents } from './RenderWidgetContents';
import { elementTemplate } from '@/components/template';

const WidgetInnerWrapper = elementTemplate('WidgetContents', 'div', (T) => (
	<T className="absolute inset-0 overflow-hidden" />
));

export function RenderWidget({
	gameId,
	documentId,
	widget,
	user,
}: {
	documentId: string;
	widget: string;
	gameId: string;
	user: UserDetails;
}) {
	const { t } = useTranslation('doc-types:Dashboard', {
		keyPrefix: 'widgets',
	});
	const gameType = useGameType(gameId);
	const document = useQuery(queries.getDocument(gameId, documentId));

	if (document.isLoading || gameType.isLoading)
		return <WidgetInnerWrapper className="bg-slate-500" />;
	const docWidgetConfig =
		gameType.data?.objectTypes[document.data?.type ?? ''].typeInfo.widgets?.[
			widget
		];
	if (document.isError || gameType.isError || !docWidgetConfig)
		return (
			<WidgetInnerWrapper className="border-4 border-red-800">
				<ErrorScreen message={t('widget-load-error')} />
			</WidgetInnerWrapper>
		);

	return (
		<WidgetInnerWrapper>
			<RenderWidgetContents
				component={docWidgetConfig.component}
				document={document.data}
				user={user}
			/>
		</WidgetInnerWrapper>
	);
}

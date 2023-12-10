import '@/utils/api/queries';
import type {
	GameObjectFormComponent,
	WidgetComponentProps,
} from '@/documents/defineDocument';
import type { Dashboard, Widget } from './types';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import { documentIdMimeType, useDropTarget } from '@/components/drag-drop';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import { useLaunchModal } from '@/utils/modal/modal-service';
import { addWidget } from './add-widget/addWidget';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGameType } from '@/apps/documents/useGameType';
import { queries } from '@/utils/api/queries';
import { ErrorScreen } from '@/components/errors/ErrorScreen';
import { useTranslation } from 'react-i18next';
import { useRealtimeApi } from '@/utils/api/realtime-api';
import type { UserDetails } from '@/api/models/UserDetails';
import {
	DashboardContainer,
	WidgetContainer,
	toGridCoordinate,
} from './grid-utils';
import type { DocumentDetails } from '@/api/models/DocumentDetails';

export function DashboardDisplay({
	document,
	form,
	user,
	onSubmit,
}: GameObjectFormComponent<Dashboard>) {
	const queryClient = useQueryClient();
	useSubmitOnChange(form, onSubmit);
	const launchModal = useLaunchModal();
	const { widgets } = useFormFields(form, { widgets: ['details', 'widgets'] });
	const dropTarget = useDropTarget({
		[documentIdMimeType]: {
			canHandle({ link }) {
				if (!link) return false;
				return 'link';
			},
			handle(ev, data) {
				if (data.gameId !== document.gameId) return false;
				const currentTarget = ev.currentTarget as HTMLDivElement;
				const rect = currentTarget.getBoundingClientRect();
				const x = toGridCoordinate(ev.clientX - Math.round(rect.left));
				const y = toGridCoordinate(ev.clientY - Math.round(rect.top));
				void addWidget(queryClient, launchModal, data, widgets, { x, y });
				console.log(data, x, y);
				return true;
			},
		},
	});

	const editing = true;
	const Container = !editing ? DashboardContainer : DashboardContainer.Editing;

	return (
		<Container {...dropTarget}>
			{Object.entries(document.details.widgets).map(([key, config]) => {
				return (
					<RenderWidget
						key={key}
						gameId={document.gameId}
						user={user}
						{...config}
					/>
				);
			})}
		</Container>
	);
}

type RenderWidgetContentsProps = {
	component: React.ComponentType<WidgetComponentProps<unknown>>;
	document: DocumentDetails;
	user: UserDetails;
};

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

function RenderWidgetContents({
	component: Component,
	document,
	user,
}: RenderWidgetContentsProps) {
	const { t: fullTranslation } = useTranslation(document.type);
	return (
		<Component document={document} user={user} translation={fullTranslation} />
	);
}

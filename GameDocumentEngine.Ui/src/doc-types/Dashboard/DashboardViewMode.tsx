import { useCallback } from 'react';
import type {
	GameObjectFormComponent,
	TypedDocumentDetails,
} from '@/documents/defineDocument';
import type { Dashboard, Widget } from './types';
import { documentIdMimeType, useDropTarget } from '@/components/drag-drop';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import { DashboardContainer, PositionedWidgetContainer } from './grid-utils';
import { RenderWidget } from './RenderWidget';
import { IconButton } from '@/components/button/icon-button';
import { HiPencil } from 'react-icons/hi2';
import { useWidgetSizes } from './useWidgetSizes';
import { useWidget } from './useWidget';
import { useNavigate } from 'react-router-dom';
import type { Atom } from 'jotai';

export function DashboardViewMode({
	document,
	writablePointers,
	form,
}: GameObjectFormComponent<Dashboard>) {
	const canUpdateWidgets = writablePointers.contains('details', 'widgets');
	const { widgets } = useFormFields(form, {
		widgets: ['details', 'widgets'],
	});
	const navigate = useNavigate();
	const onToggleEditing = canUpdateWidgets
		? () => navigate('edit')
		: () => void 0;

	const { height, width } = useWidgetSizes(widgets.atom);
	const dropTarget = useDropTarget({
		[documentIdMimeType]: {
			canHandle({ link }) {
				if (!canUpdateWidgets) return false;
				if (!link) return false;
				onToggleEditing();
				return 'link';
			},
			handle(ev, data) {
				if (data.gameId !== document.gameId) return false;
				onToggleEditing();
				return false;
			},
		},
	});
	const RenderWidgetConfig = useRenderWidgetConfig(document.gameId);

	return (
		<DashboardViewModePresentation
			canUpdateWidgets={canUpdateWidgets}
			onToggleEditing={onToggleEditing}
			document={document}
			height={height}
			width={width}
			dropTarget={dropTarget}
			RenderWidgetConfig={RenderWidgetConfig}
		/>
	);
}

function DashboardViewModePresentation({
	canUpdateWidgets,
	document,
	height,
	width,
	dropTarget,
	RenderWidgetConfig,
	onToggleEditing,
}: {
	canUpdateWidgets: boolean;
	document: TypedDocumentDetails<Dashboard>;
	height: Atom<string>;
	width: Atom<string>;
	dropTarget: ReturnType<typeof useDropTarget>;
	RenderWidgetConfig: React.FC<{ widgetConfig: Widget }>;
	onToggleEditing: () => void;
}) {
	return (
		<DashboardContainer
			{...dropTarget}
			style={{ ['--h']: height, ['--w']: width }}
		>
			{Object.entries(document.details.widgets).map(
				([key, config]: [string, Widget]) => (
					<PositionedWidgetContainer key={key} position={config.position}>
						<RenderWidgetConfig widgetConfig={config} />
					</PositionedWidgetContainer>
				),
			)}
			<div className="fixed right-4 bottom-4">
				{canUpdateWidgets && (
					<IconButton onClick={onToggleEditing}>
						<HiPencil />
					</IconButton>
				)}
			</div>
		</DashboardContainer>
	);
}

function useRenderWidgetConfig(gameId: string) {
	return useCallback(
		function RenderWidgetConfig({ widgetConfig }: { widgetConfig: Widget }) {
			const Widget = useWidget(gameId, widgetConfig);
			return (
				<RenderWidget
					errorKey={JSON.stringify(widgetConfig.settings)}
					widget={<Widget />}
				/>
			);
		},
		[gameId],
	);
}

import { useCallback } from 'react';
import type { TypedDocumentDetails } from '@/documents/defineDocument';
import type { Dashboard, Widget } from './types';
import { documentIdMimeType, useDropTarget } from '@/components/drag-drop';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { DashboardContainer, PositionedWidgetContainer } from './grid-utils';
import { RenderWidget } from './RenderWidget';
import { IconButton } from '@/components/button/icon-button';
import { HiPencil } from 'react-icons/hi2';
import { useWidgetSizes } from './useWidgetSizes';
import { useWidget } from './useWidget';

export function DashboardViewMode({
	document,
	widgets,
	canUpdateWidgets,
	onToggleEditing,
}: {
	document: TypedDocumentDetails<Dashboard>;
	widgets: FormFieldReturnType<Record<string, Widget>>;
	canUpdateWidgets: boolean;
	onToggleEditing: () => void;
}) {
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

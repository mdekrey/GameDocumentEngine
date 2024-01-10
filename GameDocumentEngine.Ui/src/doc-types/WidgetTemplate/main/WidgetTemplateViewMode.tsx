import type { TypedDocumentDetails } from '@/documents/defineDocument';
import type { WidgetTemplate, Widget } from '../types';
import { documentIdMimeType, useDropTarget } from '@/components/drag-drop';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import {
	DashboardContainer,
	PositionedWidgetContainer,
} from '@/doc-types/Dashboard/grid-utils';
import { RenderWidget } from '@/doc-types/Dashboard/RenderWidget';
import { IconButton } from '@/components/button/icon-button';
import { HiPencil } from 'react-icons/hi2';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import { useWidgetSizes } from '@/doc-types/Dashboard/useWidgetSizes';
import { useWidget } from '../useWidget';
import { useCallback } from 'react';

export function WidgetTemplateViewMode({
	document,
	previewDocument,
	widgets,
	canUpdateWidgets,
	onToggleEditing,
}: {
	document: TypedDocumentDetails<WidgetTemplate>;
	previewDocument: DocumentDetails;
	widgets: FormFieldReturnType<Record<string, Widget>>;
	canUpdateWidgets: boolean;
	onToggleEditing: () => void;
}) {
	const { height: height, width: width } = useWidgetSizes(widgets.atom);
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
	const RenderWidgetConfig = useRenderWidgetConfig(previewDocument);

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

function useRenderWidgetConfig(previewDocument: DocumentDetails) {
	return useCallback(
		function RenderWidgetConfig({ widgetConfig }: { widgetConfig: Widget }) {
			const Widget = useWidget(previewDocument, widgetConfig);
			return (
				<RenderWidget
					errorKey={JSON.stringify(widgetConfig.settings)}
					widget={<Widget />}
				/>
			);
		},
		[previewDocument],
	);
}

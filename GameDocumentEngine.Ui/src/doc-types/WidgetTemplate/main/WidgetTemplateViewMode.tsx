import type { WidgetTemplate, Widget } from '../types';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import {
	WidgetGridContainer,
	PositionedWidgetContainer,
} from '@/doc-types/Dashboard/grid-utils';
import { RenderWidget } from '@/doc-types/Dashboard/RenderWidget';
import type { DocumentDetails } from '@vaultvtt/api/openapi/models/DocumentDetails';
import { useWidgetSizes } from '@/doc-types/Dashboard/useWidgetSizes';
import { useWidget } from '../useWidget';
import { useCallback } from 'react';
import { useDocument } from '@/utils/api/hooks';

export function WidgetTemplateViewMode({
	document,
	previewDocumentId,
	form,
}: GameObjectFormComponent<WidgetTemplate> & { previewDocumentId: string }) {
	const previewDocument = useDocument(document.gameId, previewDocumentId);
	const { widgets } = useFormFields(form, {
		widgets: ['details', 'widgets'],
	});

	const { height: height, width: width } = useWidgetSizes(widgets.atom);
	const RenderWidgetConfig = useRenderWidgetConfig(previewDocument);

	return (
		<WidgetGridContainer style={{ ['--h']: height, ['--w']: width }}>
			{Object.entries(document.details.widgets).map(
				([key, config]: [string, Widget]) => (
					<PositionedWidgetContainer key={key} position={config.position}>
						<RenderWidgetConfig widgetConfig={config} />
					</PositionedWidgetContainer>
				),
			)}
		</WidgetGridContainer>
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

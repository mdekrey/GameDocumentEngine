import { useCallback } from 'react';
import '@/utils/api/queries';
import {
	type GameObjectWidgetDefinition,
	type WidgetComponentProps,
} from '@/documents/defineDocument';
import type { Widget, WidgetTemplate } from '../types';
import { useDocument } from '@/utils/api/hooks';
import { getWidgetSizes } from '@/doc-types/Dashboard/useWidgetSizes';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import { RenderWidget } from '@/doc-types/Dashboard/RenderWidget';
import { useWidget } from '../useWidget';
import { z } from 'zod';
import { PositionedWidgetContainer } from '@/doc-types/Dashboard/grid-utils';

type WidgetInstanceSettings = { displayedDocumentId: null | string };

export function TemplateInstanceDisplay({
	document,
	widgetSettings: { displayedDocumentId },
}: WidgetComponentProps<WidgetTemplate, WidgetInstanceSettings>) {
	const previewDocument = useDocument(
		document.gameId,
		displayedDocumentId ?? 'none',
	);

	const RenderWidgetConfig = useRenderWidgetConfig(previewDocument);

	return (
		<div className="relative">
			{Object.entries(document.details.widgets).map(
				([key, config]: [string, Widget]) => (
					<PositionedWidgetContainer key={key} position={config.position}>
						<RenderWidgetConfig widgetConfig={config} />
					</PositionedWidgetContainer>
				),
			)}
		</div>
	);
}

function useRenderWidgetConfig(displayedDocument: DocumentDetails) {
	return useCallback(
		function RenderWidgetConfig({ widgetConfig }: { widgetConfig: Widget }) {
			const Widget = useWidget(displayedDocument, widgetConfig);
			return (
				<RenderWidget
					errorKey={JSON.stringify(widgetConfig.settings)}
					widget={<Widget />}
				/>
			);
		},
		[displayedDocument],
	);
}

export const TemplateInstanceWidget: GameObjectWidgetDefinition<
	WidgetTemplate,
	WidgetInstanceSettings
> = {
	component: TemplateInstanceDisplay,
	defaults: { width: 10, height: 10 },
	translationKeyPrefix: '',
	getConstraints(template) {
		const sizes = getWidgetSizes(template.details.widgets);
		return { min: sizes, max: sizes };
	},
	settings: {
		schema: z.object({
			displayedDocumentId: z.string().nullable(),
		}),
		component: () => null, // TODO
		default: { displayedDocumentId: null },
	},
};

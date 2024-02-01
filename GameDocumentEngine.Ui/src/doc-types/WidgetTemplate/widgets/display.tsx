import { useCallback } from 'react';
import '@/utils/api/queries';
import type {
	WidgetSettingsComponentProps,
	GameObjectWidgetDefinition,
	WidgetComponentProps,
} from '@/documents/defineDocument';
import type { Widget, WidgetTemplate } from '../types';
import { useDocument } from '@/utils/api/hooks';
import { getWidgetSizes } from '@/doc-types/Dashboard/useWidgetSizes';
import type { DocumentDetails } from '@vaultvtt/api/openapi/models/DocumentDetails';
import { RenderWidget } from '@/doc-types/Dashboard/RenderWidget';
import { useWidget } from '../useWidget';
import { z } from 'zod';
import { PositionedWidgetContainer } from '@/doc-types/Dashboard/grid-utils';
import type { FieldMapping } from '@principlestudios/react-jotai-forms';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import { SelectDocumentByType } from '../SelectDocumentByType';

type WidgetInstanceSettings = { displayedDocumentId: null | string };

export function TemplateInstanceDisplay({
	document,
	widgetSettings: { displayedDocumentId },
}: WidgetComponentProps<WidgetTemplate, WidgetInstanceSettings>) {
	if (!displayedDocumentId) throw new Error('No document selected');
	const previewDocument = useDocument(document.gameId, displayedDocumentId);

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

const schema = z.object({
	displayedDocumentId: z.string(),
});

const mapping: FieldMapping<string | null, string> = {
	toForm: (v) => v ?? '',
	fromForm: (v) => v || null,
};

function WidgetTemplateInstanceSettingsComponent({
	document,
	field,
}: WidgetSettingsComponentProps<WidgetTemplate, WidgetInstanceSettings>) {
	const { settings } = useFormFields(field, {
		settings: {
			path: [],
			schema,
		},
	});
	const { displayedDocumentId } = useFormFields(settings, {
		displayedDocumentId: {
			path: ['displayedDocumentId'],
			mapping,
		},
	});
	return (
		<SelectDocumentByType
			gameId={document.gameId}
			docType={document.details.docType}
			field={displayedDocumentId}
		/>
	);
}

export const TemplateInstanceWidget: GameObjectWidgetDefinition<
	WidgetTemplate,
	WidgetInstanceSettings
> = {
	component: TemplateInstanceDisplay,
	defaults: { width: 10, height: 10 },
	translationKeyPrefix: 'instance',
	getConstraints(template) {
		const sizes = getWidgetSizes(template.details.widgets);
		return { min: sizes, max: sizes };
	},
	settings: {
		schema,
		component: WidgetTemplateInstanceSettingsComponent,
		default: { displayedDocumentId: null },
	},
};

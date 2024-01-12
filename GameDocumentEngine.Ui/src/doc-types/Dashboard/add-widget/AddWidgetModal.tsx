import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { type IGameObjectType } from '@/documents/defineDocument';
import { useForm } from '@principlestudios/react-jotai-forms';
import { useDocumentName } from '@/components/named-icon/useDocumentName';
import { useDocTypeTranslation, useDocument } from '@/utils/api/hooks';
import { useAtomValue } from 'jotai';
import type { NewWidgetResult } from './NewWidgetResult';
import { useWidgetSettings } from './useWidgetSettings';
import { AddWidgetModalPresentation } from './AddWidgetModalPresentation';
import { defaultMissingWidgetDefinition } from '@/documents/defaultMissingWidgetDefinition';
import { z } from 'zod';

const widgetTypeFormSchema = z.object({
	id: z.string().min(1),
});

export function AddWidgetModal({
	additional: { gameId, documentId, widgets },
	resolve,
	reject,
}: ModalContentsProps<
	NewWidgetResult,
	{
		gameId: string;
		documentId: string;
		widgets: NonNullable<IGameObjectType['widgets']>;
	}
>) {
	const DocumentName = useDocumentName(gameId, documentId);
	const document = useDocument(gameId, documentId);
	const t = useDocTypeTranslation('Dashboard', {
		keyPrefix: 'add-widget-modal',
	});

	const widgetTypes = Object.keys(widgets);
	const widgetTypeForm = useForm({
		defaultValue: { id: widgetTypes.length === 1 ? widgetTypes[0] : '' },
		schema: widgetTypeFormSchema,
		translation: t,
		fields: {
			id: ['id'],
		},
	});

	const widgetTypeKey = useAtomValue(widgetTypeForm.fields.id.atom);
	const widgetType = widgets[widgetTypeKey] ?? defaultMissingWidgetDefinition;
	const widgetSettings = useWidgetSettings({
		document,
		widgetTypeKey,
		widgetType,
	});

	return (
		<AddWidgetModalPresentation
			docTypeKey={document.type}
			widgets={widgets}
			widgetTypeField={widgetTypeForm.fields.id}
			DocumentName={DocumentName}
			WidgetSettings={widgetSettings.component}
			t={t}
			onCancel={() => reject('Cancel')}
			onSubmit={widgetSettings.handleSubmit(resolve)}
		/>
	);
}

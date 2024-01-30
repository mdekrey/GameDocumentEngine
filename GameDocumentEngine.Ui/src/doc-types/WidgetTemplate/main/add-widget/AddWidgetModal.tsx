import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { Trans, useTranslation } from 'react-i18next';
import { z } from 'zod';
import type {
	GameObjectWidgetDefinition,
	IGameObjectType,
} from '@/documents/defineDocument';
import { useForm } from '@principlestudios/react-jotai-forms';
import { useDocumentName } from '@/components/named-icon/useDocumentName';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import {
	NotSelected,
	SelectField,
} from '@/components/form-fields/select-input/select-field';
import { useDocTypeTranslation, useDocument } from '@/utils/api/hooks';
import { getDocTypeTranslationNamespace } from '@/utils/api/accessors';
import { ModalForm } from '@/utils/modal/modal-form';

export type NewWidgetResult = {
	id: string;
};
export const newWidgetSchema = z.object({
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
	const t = useDocTypeTranslation('WidgetTemplate', {
		keyPrefix: 'add-widget-modal',
	});

	const form = useForm({
		defaultValue: { id: '' },
		schema: newWidgetSchema,
		translation: t,
		fields: {
			id: ['id'],
		},
	});

	const widgetKeys = widgets ? Object.keys(widgets) : [];

	const title = (
		<Trans i18nKey="title" t={t} components={{ Document: <DocumentName /> }} />
	);
	return (
		<ModalForm
			title={title}
			onSubmit={form.handleSubmit(resolve)}
			onCancel={() => reject('Cancel')}
			translation={t}
		>
			<Fieldset>
				<SelectField field={form.fields.id} items={widgetKeys}>
					{(dt) =>
						dt ? (
							<WidgetName target={widgets[dt]} docTypeKey={document.type} />
						) : (
							<NotSelected>
								{form.fields.id.translation('not-selected')}
							</NotSelected>
						)
					}
				</SelectField>
			</Fieldset>
		</ModalForm>
	);
}

function WidgetName({
	target,
	docTypeKey,
}: {
	target: GameObjectWidgetDefinition<unknown, void>;
	docTypeKey: string;
}) {
	const { t } = useTranslation(
		target.translationNamespace ?? getDocTypeTranslationNamespace(docTypeKey),
		{
			keyPrefix: target.translationKeyPrefix,
		},
	);

	return <>{t('name')}</>;
}

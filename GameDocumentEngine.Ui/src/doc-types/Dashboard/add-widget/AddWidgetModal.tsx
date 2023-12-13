import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { Trans, useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type {
	GameObjectWidgetDefinition,
	IGameObjectType,
} from '@/documents/defineDocument';
import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import { Button } from '@/components/button/button';
import { useForm } from '@principlestudios/react-jotai-forms';
import { NamedIcon } from '@/components/named-icon/NamedIcon';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import {
	NotSelected,
	SelectField,
} from '@/components/form-fields/select-input/select-field';

export type NewWidgetResult = {
	id: string;
};
export const newWidgetSchema = z.object({
	id: z.string().min(1),
});

export function AddWidgetModal({
	additional: { docTypeKey, document, icon: Icon, widgets },
	resolve,
	reject,
}: ModalContentsProps<
	NewWidgetResult,
	{
		docTypeKey: string;
		widgets: NonNullable<IGameObjectType['widgets']>;
		icon: IGameObjectType['icon'];
		document: DocumentDetails;
	}
>) {
	const { t: tDocument } = useTranslation(`doc-types:${docTypeKey}`);
	const { t } = useTranslation('doc-types:Dashboard', {
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

	return (
		<form onSubmit={form.handleSubmit(resolve)}>
			<ModalDialogLayout>
				<ModalDialogLayout.Title>
					<Trans
						i18nKey="title"
						t={t}
						components={{
							Document: (
								<NamedIcon
									name={document.name}
									icon={Icon}
									typeName={tDocument('name')}
								/>
							),
						}}
					/>
				</ModalDialogLayout.Title>
				<Fieldset>
					<SelectField field={form.fields.id} items={widgetKeys}>
						{(dt) =>
							dt ? (
								<WidgetName target={widgets[dt]} docTypeKey={docTypeKey} />
							) : (
								<NotSelected>
									{form.fields.id.translation('not-selected')}
								</NotSelected>
							)
						}
					</SelectField>
				</Fieldset>

				<ModalDialogLayout.Buttons>
					<Button.Save type="submit">{t('submit')}</Button.Save>
					<Button.Secondary onClick={() => reject('Cancel')}>
						{t('cancel')}
					</Button.Secondary>
				</ModalDialogLayout.Buttons>
			</ModalDialogLayout>
		</form>
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
		target.translationNamespace ?? `doc-types:${docTypeKey}`,
		{
			keyPrefix: target.translationKeyPrefix,
		},
	);

	return <>{t('name')}</>;
}

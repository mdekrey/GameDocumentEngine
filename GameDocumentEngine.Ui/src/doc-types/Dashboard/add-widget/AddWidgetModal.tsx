import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { Trans, useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { IGameObjectType } from '@/documents/defineDocument';
import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import { Button } from '@/components/button/button';
import { useForm } from '@principlestudios/react-jotai-forms';
import { NamedIcon } from './NamedIcon';

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

				{widgetKeys.join(', ')}
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

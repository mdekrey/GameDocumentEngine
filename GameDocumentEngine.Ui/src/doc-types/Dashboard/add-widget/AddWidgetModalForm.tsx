import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import { Prose } from '@/components/text/common';
import { Button } from '@/components/button/button';
import { useForm } from '@principlestudios/react-jotai-forms';
import type { z } from 'zod';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { TFunction } from 'i18next';
import type { IconType } from 'react-icons';
import type { IGameObjectType } from '@/documents/defineDocument';
import type { NewWidgetResult } from './AddWidgetModal';
import { newWidgetSchema } from './AddWidgetModal';
import { useTranslation } from 'react-i18next';

export function AddWidgetModalForm({
	dropped,
	tDocument: objT,
	icon: Icon,
	widgets,
	resolve,
	reject,
}: {
	dropped: DocumentDetails;
	tDocument: TFunction;
	icon: IconType;
	widgets: NonNullable<IGameObjectType['widgets']>;
	resolve: (result: NewWidgetResult) => void;
	reject: (error: unknown) => void;
}) {
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
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<ModalDialogLayout>
				<ModalDialogLayout.Title>{t('title')}</ModalDialogLayout.Title>
				<Icon /> {dropped.name} {objT('name')}
				<Prose>{t('intro')}</Prose>
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

	function onSubmit({ id }: z.infer<typeof newWidgetSchema>) {
		const { width, height } = widgets[id].defaults;
		resolve({
			id,
			defaults: { width, height },
		});
	}
}

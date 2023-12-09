import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import { Button } from '@/components/button/button';
import { useForm } from '@principlestudios/react-jotai-forms';
import type { z } from 'zod';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { TFunction } from 'i18next';
import type { IconType } from 'react-icons';
import type { IGameObjectType } from '@/documents/defineDocument';
import type { NewWidgetResult } from './AddWidgetModal';
import { newWidgetSchema } from './AddWidgetModal';
import { Trans, useTranslation } from 'react-i18next';
import { NamedIcon } from './NamedIcon';

export function AddWidgetModalForm({
	document,
	tDocument: objT,
	icon: Icon,
	widgets,
	resolve,
	reject,
}: {
	document: DocumentDetails;
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
				<ModalDialogLayout.Title>
					<Trans
						i18nKey="title"
						t={t}
						components={{
							Document: (
								<NamedIcon
									name={document.name}
									icon={Icon}
									typeName={objT('name')}
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

	function onSubmit({ id }: z.infer<typeof newWidgetSchema>) {
		const { width, height } = widgets[id].defaults;
		resolve({
			id,
			defaults: { width, height },
		});
	}
}

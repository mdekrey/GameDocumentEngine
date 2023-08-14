import { Button } from '@/components/button/button';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { TextField } from '@/components/form-fields/text-field/text-field';
import { useForm } from '@/utils/form/useForm';
import { ModalAlertLayout } from '@/utils/modal/alert-layout';
import { ModalContentsProps } from '@/utils/modal/modal-service';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { z } from 'zod';

export function DeleteDocumentModal({
	resolve,
	reject,
	additional: { name: originalName },
}: ModalContentsProps<boolean, { name: string }>) {
	const { t } = useTranslation(['delete-document']);
	const DeleteDocument = useMemo(
		() =>
			z.object({
				name: z
					.string()
					.refinement((name) => name === originalName, { code: 'custom' }),
			}),
		[originalName],
	);
	const form = useForm({
		schema: DeleteDocument,
		translation: t,
		defaultValue: { name: '' },
		fields: { name: ['name'] },
	});

	return (
		<form className="w-full h-full" onSubmit={form.handleSubmit(onSubmit)}>
			<ModalAlertLayout>
				<ModalAlertLayout.Title>{t('title')}</ModalAlertLayout.Title>
				<p className="text-sm text-gray-500">
					<Trans
						i18nKey="are-you-sure"
						t={t}
						values={{ name: originalName }}
						components={[<span className="font-bold" />]}
					/>
				</p>
				<p className="text-sm text-gray-500">
					{t('please-type-name-to-confirm')}
				</p>
				<Fieldset className="m-0">
					<TextField field={form.fields.name} />
				</Fieldset>
				<ModalAlertLayout.Buttons>
					<Button.Destructive type="submit">{t('submit')}</Button.Destructive>
					<Button.Secondary onClick={() => reject('Cancel')}>
						{t('cancel')}
					</Button.Secondary>
				</ModalAlertLayout.Buttons>
			</ModalAlertLayout>
		</form>
	);

	function onSubmit() {
		resolve(true);
	}
}

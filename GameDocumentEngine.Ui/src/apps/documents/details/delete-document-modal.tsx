import { Button } from '@/components/button/button';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { Prose } from '@/components/text/common';
import { useForm } from '@/utils/form/useForm';
import { ModalAlertLayout } from '@/utils/modal/alert-layout';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
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
				<Prose>
					<Trans
						i18nKey="are-you-sure"
						t={t}
						values={{ name: originalName }}
						components={[<span className="font-bold" />]}
					/>
				</Prose>
				<Prose>{t('please-type-name-to-confirm')}</Prose>
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

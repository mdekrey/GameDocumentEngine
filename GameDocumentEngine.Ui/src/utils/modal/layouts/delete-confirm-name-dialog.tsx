import { Button } from '@/components/button/button';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { useForm } from '@/utils/form';
import { ModalAlertLayout } from '@/utils/modal/alert-layout';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useCallback, useMemo } from 'react';
import { type TFunction } from 'i18next';
import { Trans } from 'react-i18next';
import { z } from 'zod';
import { Prose } from '@/components/text/common';

export function DeleteConfirmNameModal({
	resolve,
	reject,
	additional: { name: originalName, translation: t },
}: ModalContentsProps<boolean, { name: string; translation: TFunction }>) {
	const nameMatchSchema = useMemo(
		() =>
			z.object({
				name: z
					.string()
					.refinement((name) => name === originalName, { code: 'custom' }),
			}),
		[originalName],
	);
	const form = useForm({
		schema: nameMatchSchema,
		defaultValue: { name: '' },
		fields: { name: ['name'] },
		translation: t,
	});
	const NameComponent = useCallback(
		function Name() {
			return <span className="font-bold">{originalName}</span>;
		},
		[originalName],
	);

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<ModalAlertLayout>
				<ModalAlertLayout.Title>{t('title')}</ModalAlertLayout.Title>
				<Prose>
					<Trans
						i18nKey="are-you-sure"
						t={t}
						components={{
							Target: <NameComponent />,
						}}
					/>
				</Prose>
				<Prose>{t('please-type-name-to-confirm')}</Prose>
				<Fieldset>
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

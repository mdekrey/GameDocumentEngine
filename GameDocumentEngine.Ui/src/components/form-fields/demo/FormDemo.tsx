import { useForm } from '@/utils/form';
import { z } from 'zod';
import { ButtonRow } from '../../button/button-row';
import { Button } from '../../button/button';
import { TextField } from '../text-input/text-field';
import { Fieldset } from '../fieldset/fieldset';
import { useTranslation } from 'react-i18next';

const myFormSchema = z.object({
	name: z.string(),
});

type MyForm = z.infer<typeof myFormSchema>;
const defaultValue = { name: '' } satisfies MyForm;

type FormDemoProps = {
	onSubmit: (data: MyForm) => void;
};

export function FormDemo({ onSubmit }: FormDemoProps) {
	const { t } = useTranslation(['demo']);
	const form = useForm({
		schema: myFormSchema,
		defaultValue,
		translation: t,
	});

	return (
		<form className="w-full h-full" onSubmit={form.handleSubmit(onSubmit)}>
			<Fieldset>
				<TextField field={form.field(['name'])} />
				<ButtonRow>
					<Button type="submit">{t('submit')}</Button>
				</ButtonRow>
			</Fieldset>
		</form>
	);
}

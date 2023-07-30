import { Updater } from '../defineDocument';
import { useForm } from '@/utils/form/useForm';
import { Fieldset } from '@/utils/form/fieldset/fieldset';
import { ButtonRow } from '@/components/button/button-row';
import { Button } from '@/components/button/button';
import { Clock, ClockDocument } from './clock-types';
import { applyPatch, createPatch } from 'rfc6902';
import { updateFormDefault } from '@/utils/form/update-form-default';
import { useTranslation } from 'react-i18next';
import { TextField } from '@/utils/form/text-field/text-field';
import { NumberField } from '@/utils/form/number-field/number-field';

export function ClockEdit({
	clock,
	onUpdateClock,
}: {
	clock: ClockDocument;
	onUpdateClock: Updater<Clock>;
}) {
	const { t } = useTranslation('doc-types:Clock', { keyPrefix: 'edit-clock' });
	const form = useForm({
		defaultValue: clock,
		schema: ClockDocument,
		translation: t,
		fields: {
			name: ['name'],
			current: ['details', 'current'],
			max: ['details', 'max'],
		},
	});
	updateFormDefault(form, clock);

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<Fieldset>
				<TextField field={form.fields.name} />
				<NumberField.Integer field={form.fields.current} />
				<NumberField.Integer field={form.fields.max} />
				<ButtonRow>
					<Button type="submit">{t('submit')}</Button>
				</ButtonRow>
			</Fieldset>
		</form>
	);

	function onSubmit(currentValue: ClockDocument) {
		const ops = createPatch(clock, currentValue);
		onUpdateClock((prev) => {
			applyPatch(prev, ops);
		});
	}
}

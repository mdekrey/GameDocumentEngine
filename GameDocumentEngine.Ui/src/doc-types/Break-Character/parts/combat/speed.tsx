import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import type { Character } from '../../character-types';
import { CardHint, CardTitle, Container } from './atoms';
import { GiRun } from 'react-icons/gi';
import { SelectField } from '@/components/form-fields/select-input/select-field';
import { TextareaField } from '@/components/form-fields/textarea-input/textarea-field';

const speeds = ['slow', 'average', 'fast', 'very-fast'] as const;

export function Speed({
	form,
}: Pick<GameObjectFormComponent<Character>, 'form'>) {
	const fields = useFormFields(form, {
		speed: ['details', 'combatValues', 'speed'],
	});

	return <SpeedFields form={fields.speed} />;
}

export function SpeedFields({
	form,
}: {
	form: FormFieldReturnType<Character['combatValues']['speed']>;
}) {
	const fields = useFormFields(form, {
		base: ['base'],
		actual: ['actual'],
		modifiers: ['modifiers'],
	});

	return (
		<Container>
			<GiRun />
			<CardTitle>{form.translation('title')}</CardTitle>
			<CardHint>{form.translation('hint')}</CardHint>
			<SelectField field={fields.base} items={speeds}>
				{form.translation}
			</SelectField>
			<SelectField field={fields.actual} items={speeds}>
				{form.translation}
			</SelectField>
			<TextareaField field={fields.modifiers} />
		</Container>
	);
}

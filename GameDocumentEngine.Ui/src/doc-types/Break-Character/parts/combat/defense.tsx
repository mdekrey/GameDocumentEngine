import { NumberField } from '@/components/form-fields/text-input/number-field';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import type { Character } from '../../character-types';
import { CardHint, CardTitle, Container } from './atoms';
import { LuShield } from 'react-icons/lu';
import { TextareaField } from '@/components/form-fields/textarea-input/textarea-field';

export function Defense({
	form,
}: Pick<GameObjectFormComponent<Character>, 'form'>) {
	const fields = useFormFields(form, {
		defense: ['details', 'combatValues', 'defense'],
	});

	return <DefenseFields form={fields.defense} />;
}

export function DefenseFields({
	form,
}: {
	form: FormFieldReturnType<Character['combatValues']['defense']>;
}) {
	const fields = useFormFields(form, {
		base: ['base'],
		modifiers: ['modifiers'],
	});

	return (
		<Container>
			<LuShield />
			<CardTitle>{form.translation('title')}</CardTitle>
			<CardHint>{form.translation('hint')}</CardHint>
			<NumberField.Integer field={fields.base} />
			{/* TODO */}
			<TextareaField field={fields.modifiers} />
		</Container>
	);
}

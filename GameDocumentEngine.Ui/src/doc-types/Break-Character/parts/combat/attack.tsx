import { LuSword } from 'react-icons/lu';
import { NumberField } from '@/components/form-fields/text-input/number-field';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import type { Character } from '../../character-types';
import { CardHint, CardTitle, Container } from './atoms';

export function Attack({
	form,
}: Pick<GameObjectFormComponent<Character>, 'form'>) {
	const fields = useFormFields(form, {
		attack: ['details', 'combatValues', 'attack'],
	});

	return <AttackFields form={fields.attack} />;
}

export function AttackFields({
	form,
}: {
	form: FormFieldReturnType<Character['combatValues']['attack']>;
}) {
	const fields = useFormFields(form, {
		attackBonus: ['attackBonus'],
	});

	return (
		<Container>
			<LuSword />
			<CardTitle>{form.translation('title')}</CardTitle>
			<CardHint>{form.translation('hint')}</CardHint>
			<NumberField.Integer field={fields.attackBonus} />
			{/* TODO: weapons */}
		</Container>
	);
}

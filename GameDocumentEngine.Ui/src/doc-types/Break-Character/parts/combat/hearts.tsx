import { NumberField } from '@/components/form-fields/text-input/number-field';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import type { Character } from '../../character-types';
import { CardHint, CardTitle, Container } from './atoms';
import { HiOutlineHeart } from 'react-icons/hi2';
import { TextareaField } from '@/components/form-fields/textarea-input/textarea-field';

export function Hearts({
	form,
}: Pick<GameObjectFormComponent<Character>, 'form'>) {
	const fields = useFormFields(form, {
		hearts: ['details', 'combatValues', 'hearts'],
	});

	return <HeartsFields form={fields.hearts} />;
}

export function HeartsFields({
	form,
}: {
	form: FormFieldReturnType<Character['combatValues']['hearts']>;
}) {
	const fields = useFormFields(form, {
		base: ['base'],
		modifiers: ['modifiers'],
		injuries: ['injuries'],
	});

	return (
		<Container>
			<HiOutlineHeart />
			<CardTitle>{form.translation('title')}</CardTitle>
			<CardHint>{form.translation('hint')}</CardHint>
			<NumberField.Integer field={fields.base} />
			{/* TODO */}
			<TextareaField field={fields.modifiers} />
			<TextareaField field={fields.injuries} />
		</Container>
	);
}

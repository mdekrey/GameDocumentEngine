import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import type { Character } from '../../character-types';
import {
	CardBase,
	CardContents,
	CardHint,
	CardIcon,
	CardTitle,
	Container,
} from './atoms';
import { LuShield } from 'react-icons/lu';
import { TextareaField } from '@/components/form-fields/textarea-input/textarea-field';
import { CircularNumberField } from '../CircularNumberField';

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
		total: ['total'],
		modifiers: ['modifiers'],
	});

	return (
		<Container>
			<CardIcon icon={LuShield} />
			<CardTitle>{form.translation('title')}</CardTitle>
			<CardHint>{form.translation('hint')}</CardHint>
			<CardBase>
				<CircularNumberField field={fields.base} />
			</CardBase>
			<CardContents className="flex flex-row gap-4">
				<CircularNumberField field={fields.total} />
				{/* TODO */}
				<TextareaField field={fields.modifiers} className="flex-1" />
			</CardContents>
		</Container>
	);
}

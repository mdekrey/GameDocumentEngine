import { NumberField } from '@/components/form-fields/text-input/number-field';
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
import { HiOutlineHeart } from 'react-icons/hi2';
import { TextareaField } from '@/components/form-fields/textarea-input/textarea-field';
import { CircularNumberField } from '../CircularNumberField';

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
		total: ['total'],
		current: ['current'],
		modifiers: ['modifiers'],
		injuries: ['injuries'],
	});

	return (
		<Container>
			<CardIcon icon={HiOutlineHeart} />
			<CardTitle>{form.translation('title')}</CardTitle>
			<CardHint>{form.translation('hint')}</CardHint>

			<CardBase>
				<CircularNumberField field={fields.base} />
			</CardBase>
			<CardContents>
				<NumberField.Integer field={fields.total} />
				<NumberField.Integer field={fields.current} />
				<TextareaField field={fields.modifiers} />
				<TextareaField field={fields.injuries} />
			</CardContents>
		</Container>
	);
}

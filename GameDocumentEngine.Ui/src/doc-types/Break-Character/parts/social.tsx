import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { Character } from '../character-types';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import { TextareaField } from '@/components/form-fields/textarea-input/textarea-field';
import { NumberField } from '@/components/form-fields/text-input/number-field';

export function Social({ form }: GameObjectFormComponent<Character>) {
	const fields = useFormFields(form, {
		social: ['details', 'social'],
		darkPoints: ['details', 'allegience', 'darkPoints'],
		brightPoints: ['details', 'allegience', 'brightPoints'],
		gifts: ['details', 'allegience', 'gifts'],
	});

	return (
		<>
			<TextareaField field={fields.social} />
			<NumberField.Integer field={fields.darkPoints} />
			<NumberField.Integer field={fields.brightPoints} />
			<TextareaField field={fields.gifts} />
		</>
	);
}

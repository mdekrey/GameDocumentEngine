import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { Character } from '../character-types';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import { TextareaField } from '@/components/form-fields/textarea-input/textarea-field';
import { CircularNumberField } from './CircularNumberField';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';

export function Social({ form }: GameObjectFormComponent<Character>) {
	const fields = useFormFields(form, {
		social: ['details', 'social'],
		darkPoints: ['details', 'allegience', 'darkPoints'],
		brightPoints: ['details', 'allegience', 'brightPoints'],
		gifts: ['details', 'allegience', 'gifts'],
	});

	return (
		<Fieldset>
			<TextareaField field={fields.social} />
			<div className="grid grid-rows-2 grid-cols-2 gap-4">
				<CircularNumberField.TextRight
					field={fields.darkPoints}
					className="col-start-1"
				/>
				<CircularNumberField.TextRight
					field={fields.brightPoints}
					className="col-start-1"
				/>
				<TextareaField
					field={fields.gifts}
					className="row-span-2 col-start-2 row-start-1"
				/>
			</div>
		</Fieldset>
	);
}

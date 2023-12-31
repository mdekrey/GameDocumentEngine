import type { UseFormResult } from '@/utils/form';
import { useFormFields } from '@/utils/form';
import type { CharacterDocument } from '../character-types';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { TextareaField } from '@/components/form-fields/textarea-input/textarea-field';

export function Notes({ form }: { form: UseFormResult<CharacterDocument> }) {
	const fields = useFormFields(form, {
		equipment: ['details', 'notes', 'equipment'],
		contacts: ['details', 'notes', 'contacts'],
	});
	return (
		<Fieldset>
			<TextareaField.AllowUndefined field={fields.equipment} description />
			<TextareaField.AllowUndefined field={fields.contacts} />
		</Fieldset>
	);
}

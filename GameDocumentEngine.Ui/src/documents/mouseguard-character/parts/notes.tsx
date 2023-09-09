import type { UseFormResult } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import type { CharacterDocument } from '../character-types';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { TextareaField } from '@/components/form-fields/textarea-input/textarea-field';
import { DocumentPointers } from '@/documents/get-document-pointers';

export function Notes({
	form,
	writablePointers,
}: {
	form: UseFormResult<CharacterDocument>;
	writablePointers: DocumentPointers;
}) {
	const fields = useFormFields(form, {
		equipment: ['details', 'notes', 'equipment'],
		contacts: ['details', 'notes', 'contacts'],
	});
	const notesPointers = writablePointers.navigate('details', 'notes');
	return (
		<Fieldset>
			<TextareaField.AllowUndefined
				field={fields.equipment}
				description
				readOnly={!notesPointers.contains('equipment')}
			/>
			<TextareaField.AllowUndefined
				field={fields.contacts}
				readOnly={!notesPointers.contains('contacts')}
			/>
		</Fieldset>
	);
}

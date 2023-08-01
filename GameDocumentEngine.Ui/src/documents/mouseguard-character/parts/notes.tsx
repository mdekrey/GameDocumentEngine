import { UseFormResult } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import { CharacterDocument } from '../character-types';
import { useDebugValue } from 'react';
import { Fieldset } from '@/utils/form-fields/fieldset/fieldset';
import { TextField } from '@/utils/form-fields/text-field/text-field';

export function Notes({ form }: { form: UseFormResult<CharacterDocument> }) {
	const fields = useFormFields(form, {
		equipment: ['details', 'notes', 'equipment'],
		contacts: ['details', 'notes', 'contacts'],
	});
	useDebugValue(fields);
	return (
		<Fieldset>
			<TextField.AllowUndefined field={fields.equipment} description />
			<TextField.AllowUndefined field={fields.contacts} />
		</Fieldset>
	);
}
import type { UseFormResult } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import type { CharacterDocument } from '../character-types';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { TextareaField } from '@/components/form-fields/textarea-input/textarea-field';
import { DocumentPointers } from '@/documents/get-document-pointers';

export function Personality({
	form,
	writablePointers,
}: {
	form: UseFormResult<CharacterDocument>;
	writablePointers: DocumentPointers;
}) {
	const fields = useFormFields(form, {
		belief: ['details', 'personality', 'belief'],
		goal: ['details', 'personality', 'goal'],
		instinct: ['details', 'personality', 'instinct'],
	});
	const pointers = writablePointers.navigate('details', 'personality');
	return (
		<Fieldset>
			<TextareaField.AllowUndefined
				field={fields.belief}
				readOnly={pointers.contains('belief')}
			/>
			<TextareaField.AllowUndefined
				field={fields.goal}
				readOnly={pointers.contains('goal')}
			/>
			<TextareaField.AllowUndefined
				field={fields.instinct}
				readOnly={pointers.contains('instinct')}
			/>
		</Fieldset>
	);
}

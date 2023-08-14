import { UseFormResult } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import { CharacterDocument } from '../character-types';
import { useDebugValue } from 'react';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { TextareaField } from '@/components/form-fields/textarea-field/textarea-field';

export function Personality({
	form,
}: {
	form: UseFormResult<CharacterDocument>;
}) {
	const fields = useFormFields(form, {
		belief: ['details', 'personality', 'belief'],
		goal: ['details', 'personality', 'goal'],
		instinct: ['details', 'personality', 'instinct'],
	});
	useDebugValue(fields);
	return (
		<Fieldset>
			<TextareaField.AllowUndefined field={fields.belief} />
			<TextareaField.AllowUndefined field={fields.goal} />
			<TextareaField.AllowUndefined field={fields.instinct} />
		</Fieldset>
	);
}

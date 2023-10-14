import type { UseFormResult } from '@/utils/form';
import { useFormFields } from '@/utils/form';
import type { CharacterDocument } from '../character-types';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { TextareaField } from '@/components/form-fields/textarea-input/textarea-field';

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
	return (
		<Fieldset>
			<TextareaField.AllowUndefined field={fields.belief} />
			<TextareaField.AllowUndefined field={fields.goal} />
			<TextareaField.AllowUndefined field={fields.instinct} />
		</Fieldset>
	);
}

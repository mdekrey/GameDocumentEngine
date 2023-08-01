import { UseFormResult } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import { CharacterDocument } from '../character-types';
import { useDebugValue } from 'react';
import { Fieldset } from '@/utils/form/fieldset/fieldset';
import { TextField } from '@/utils/form/text-field/text-field';

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
			<TextField.AllowUndefined field={fields.belief} />
			<TextField.AllowUndefined field={fields.goal} />
			<TextField.AllowUndefined field={fields.instinct} />
		</Fieldset>
	);
}

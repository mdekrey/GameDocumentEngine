import type { UseFormResult } from '@/utils/form';
import { useFormFields } from '@/utils/form';
import type { CharacterDocument } from '../character-types';
import { NumberField } from '@/components/form-fields/text-input/number-field';

export function Rewards({ form }: { form: UseFormResult<CharacterDocument> }) {
	const fields = useFormFields(form, {
		fate: ['details', 'rewards', 'fate'],
		persona: ['details', 'rewards', 'persona'],
		checks: ['details', 'rewards', 'checks'],
	});

	return (
		<>
			<NumberField.Integer field={fields.fate} description />
			<NumberField.Integer field={fields.persona} description />
			<NumberField.Integer field={fields.checks} description />
		</>
	);
}

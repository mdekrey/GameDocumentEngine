import type { UseFormResult } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import type { CharacterDocument } from '../character-types';
import { NumberField } from '@/components/form-fields/text-input/number-field';
import { DocumentPointers } from '@/documents/get-document-pointers';

export function Rewards({
	form,
	writablePointers,
}: {
	form: UseFormResult<CharacterDocument>;
	writablePointers: DocumentPointers;
}) {
	const fields = useFormFields(form, {
		fate: ['details', 'rewards', 'fate'],
		persona: ['details', 'rewards', 'persona'],
		checks: ['details', 'rewards', 'checks'],
	});
	const rewards = writablePointers.navigate('details', 'rewards');

	return (
		<>
			<NumberField.Integer
				field={fields.fate}
				description
				readOnly={!rewards.contains('fate')}
			/>
			<NumberField.Integer
				field={fields.persona}
				description
				readOnly={!rewards.contains('persona')}
			/>
			<NumberField.Integer
				field={fields.checks}
				description
				readOnly={!rewards.contains('checks')}
			/>
		</>
	);
}

import type { UseFormResult } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import type { CharacterDocument } from '../character-types';
import {
	CheckboxField,
	undefinedAsFalseMapping,
} from '@/components/form-fields/checkbox-input/checkbox-field';
import { DocumentPointers } from '@/documents/get-document-pointers';

export function Conditions({
	form,
	writablePointers,
}: {
	form: UseFormResult<CharacterDocument>;
	writablePointers: DocumentPointers;
}) {
	const fields = useFormFields(form, {
		hungryThirsty: {
			path: ['details', 'conditions', 'hungryThirsty'],
			mapping: undefinedAsFalseMapping,
		},
		angry: {
			path: ['details', 'conditions', 'angry'],
			mapping: undefinedAsFalseMapping,
		},
		tired: {
			path: ['details', 'conditions', 'tired'],
			mapping: undefinedAsFalseMapping,
		},
		injured: {
			path: ['details', 'conditions', 'injured'],
			mapping: undefinedAsFalseMapping,
		},
		sick: {
			path: ['details', 'conditions', 'sick'],
			mapping: undefinedAsFalseMapping,
		},
	});
	const conditions = writablePointers.navigate('details', 'conditions');
	return (
		<>
			<CheckboxField
				field={fields.hungryThirsty}
				readOnly={!conditions.contains('hungryThirsty')}
			/>
			<CheckboxField
				field={fields.angry}
				readOnly={!conditions.contains('angry')}
			/>
			<CheckboxField
				field={fields.tired}
				readOnly={!conditions.contains('tired')}
			/>
			<CheckboxField
				field={fields.injured}
				readOnly={!conditions.contains('injured')}
			/>
			<CheckboxField
				field={fields.sick}
				readOnly={!conditions.contains('sick')}
			/>
		</>
	);
}

import type { UseFormResult } from '@/utils/form';
import { useFormFields } from '@/utils/form';
import type { CharacterDocument } from '../character-types';
import {
	CheckboxField,
	undefinedAsFalseMapping,
} from '@/components/form-fields/checkbox-input/checkbox-field';

export function Conditions({
	form,
}: {
	form: UseFormResult<CharacterDocument>;
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
	return (
		<>
			<CheckboxField field={fields.hungryThirsty} />
			<CheckboxField field={fields.angry} />
			<CheckboxField field={fields.tired} />
			<CheckboxField field={fields.injured} />
			<CheckboxField field={fields.sick} />
		</>
	);
}

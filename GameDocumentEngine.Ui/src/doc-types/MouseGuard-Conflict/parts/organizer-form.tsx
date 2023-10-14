import { useFormFields } from '@/utils/form';
import type { FormFieldReturnType } from '@/utils/form';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { TextField } from '@/components/form-fields/text-input/text-field';
import type { ConflictGeneral } from '../conflict-types';
import type { FieldMapping } from '@/utils/form';

const arrayWithCommas: FieldMapping<string[], string> = {
	toForm: function (v) {
		return v
			.map((entry) => entry[0].toUpperCase() + entry.substring(1))
			.join(', ');
	},
	fromForm: function (v) {
		return v
			.split(',')
			.map((entry) => entry.toLowerCase().trim())
			.filter((entry) => !!entry);
	},
};

export function OrganizerForm({
	name,
	general,
	sideAName,
	sideBName,
}: {
	name: FormFieldReturnType<string>;
	general: FormFieldReturnType<ConflictGeneral>;
	sideAName: FormFieldReturnType<string>;
	sideBName: FormFieldReturnType<string>;
}) {
	const { type, attackSkills, defendSkills, feintSkills, maneuverSkills } =
		useFormFields(general, {
			type: ['type'],
			attackSkills: { path: ['skills', 'attack'], mapping: arrayWithCommas },
			defendSkills: { path: ['skills', 'defend'], mapping: arrayWithCommas },
			feintSkills: { path: ['skills', 'feint'], mapping: arrayWithCommas },
			maneuverSkills: {
				path: ['skills', 'maneuver'],
				mapping: arrayWithCommas,
			},
		});

	return (
		<Fieldset>
			<TextField field={name} />
			<TextField field={type} />
			<TextField field={attackSkills} />
			<TextField field={defendSkills} />
			<TextField field={feintSkills} />
			<TextField field={maneuverSkills} />
			<TextField field={sideAName} />
			<TextField field={sideBName} />
		</Fieldset>
	);
}

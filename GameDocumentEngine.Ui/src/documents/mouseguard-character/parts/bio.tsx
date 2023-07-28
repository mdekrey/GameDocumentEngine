import { useDebugValue } from 'react';
import { CharacterDocument } from '../character-types';
import { UseFormResult, useFormFields } from '@/utils/form/useForm';
import {
	NumberField,
	undefinedOrIntegerMapping,
} from '@/utils/form/number-field/number-field';
import { Fieldset } from '@/utils/form/fieldset/fieldset';
import {
	TextField,
	undefinedAsEmptyStringMapping,
} from '@/utils/form/text-field/text-field';

export function Bio({ form }: { form: UseFormResult<CharacterDocument> }) {
	useDebugValue({ form });
	const fields = useFormFields(form, {
		name: ['name'],
		age: {
			path: ['details', 'bio', 'age'],
			mapping: undefinedOrIntegerMapping,
		},
		home: {
			path: ['details', 'bio', 'home'],
			mapping: undefinedAsEmptyStringMapping,
		},
		furColor: {
			path: ['details', 'bio', 'furColor'],
			mapping: undefinedAsEmptyStringMapping,
		},
		guardRank: {
			path: ['details', 'bio', 'guardRank'],
			mapping: undefinedAsEmptyStringMapping,
		},
		cloakColor: {
			path: ['details', 'bio', 'cloakColor'],
			mapping: undefinedAsEmptyStringMapping,
		},
		parents: {
			path: ['details', 'bio', 'parents'],
			mapping: undefinedAsEmptyStringMapping,
		},
		senior: {
			path: ['details', 'bio', 'senior'],
			mapping: undefinedAsEmptyStringMapping,
		},
		mentor: {
			path: ['details', 'bio', 'mentor'],
			mapping: undefinedAsEmptyStringMapping,
		},
		friend: {
			path: ['details', 'bio', 'friend'],
			mapping: undefinedAsEmptyStringMapping,
		},
		enemy: {
			path: ['details', 'bio', 'enemy'],
			mapping: undefinedAsEmptyStringMapping,
		},
	});
	return (
		<div>
			<Fieldset>
				<TextField field={fields.name} />
				<NumberField field={fields.age} />
				<TextField field={fields.home} />
				<TextField field={fields.furColor} />
				<TextField field={fields.guardRank} />
				<TextField field={fields.cloakColor} />
			</Fieldset>
			<Fieldset>
				<TextField field={fields.parents} />
				<TextField field={fields.mentor} />
				<TextField field={fields.senior} />
				<TextField field={fields.friend} />
				<TextField field={fields.enemy} />
			</Fieldset>
		</div>
	);
}

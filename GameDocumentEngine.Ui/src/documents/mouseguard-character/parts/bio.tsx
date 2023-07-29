import { CharacterDocument } from '../character-types';
import { UseFormResult, useFormFields } from '@/utils/form/useForm';
import {
	NumberField,
	undefinedOrIntegerMapping,
} from '@/utils/form/number-field/number-field';
import { Fieldset } from '@/utils/form/fieldset/fieldset';
import {
	TextField,
	undefinedAsEmptyStringMapping as emptyStringUndefined,
} from '@/utils/form/text-field/text-field';

export function Bio({ form }: { form: UseFormResult<CharacterDocument> }) {
	const fields = useFormFields(form, {
		name: ['name'],
		age: ['details', 'bio', 'age'],
		home: ['details', 'bio', 'home'],
		furColor: ['details', 'bio', 'furColor'],
		guardRank: ['details', 'bio', 'guardRank'],
		cloakColor: ['details', 'bio', 'cloakColor'],
		parents: ['details', 'bio', 'parents'],
		senior: ['details', 'bio', 'senior'],
		mentor: ['details', 'bio', 'mentor'],
		friend: ['details', 'bio', 'friend'],
		enemy: ['details', 'bio', 'enemy'],
	});
	return (
		<div>
			<Fieldset>
				<TextField field={fields.name} />
				<NumberField field={fields.age} mapping={undefinedOrIntegerMapping} />
				<TextField field={fields.home} mapping={emptyStringUndefined} />
				<TextField field={fields.furColor} mapping={emptyStringUndefined} />
				<TextField field={fields.guardRank} mapping={emptyStringUndefined} />
				<TextField field={fields.cloakColor} mapping={emptyStringUndefined} />
			</Fieldset>
			<Fieldset>
				<TextField field={fields.parents} mapping={emptyStringUndefined} />
				<TextField field={fields.mentor} mapping={emptyStringUndefined} />
				<TextField field={fields.senior} mapping={emptyStringUndefined} />
				<TextField field={fields.friend} mapping={emptyStringUndefined} />
				<TextField field={fields.enemy} mapping={emptyStringUndefined} />
			</Fieldset>
		</div>
	);
}

import { CharacterDocument } from '../character-types';
import { UseFormResult, useFormFields } from '@/utils/form/useForm';
import {
	NumberField,
	undefinedOrIntegerMapping,
} from '@/utils/form/number-field/number-field';
import { Fieldset } from '@/utils/form/fieldset/fieldset';
import { TextField } from '@/utils/form/text-field/text-field';

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
		<div className="grid grid-cols-2 gap-2">
			<Fieldset>
				<TextField field={fields.name} />
				<NumberField field={fields.age} mapping={undefinedOrIntegerMapping} />
				<TextField.AllowUndefined field={fields.home} />
				<TextField.AllowUndefined field={fields.furColor} />
				<TextField.AllowUndefined field={fields.guardRank} />
				<TextField.AllowUndefined field={fields.cloakColor} />
			</Fieldset>
			<Fieldset>
				<TextField.AllowUndefined field={fields.parents} />
				<TextField.AllowUndefined field={fields.mentor} />
				<TextField.AllowUndefined field={fields.senior} />
				<TextField.AllowUndefined field={fields.friend} />
				<TextField.AllowUndefined field={fields.enemy} />
			</Fieldset>
		</div>
	);
}

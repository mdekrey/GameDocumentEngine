import type { CharacterDocument } from '../character-types';
import type { UseFormResult } from '@/utils/form';
import { useFormFields } from '@/utils/form';
import { NumberField } from '@/components/form-fields/text-input/number-field';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { TextField } from '@/components/form-fields/text-input/text-field';

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
		<div className="flex flex-col md:grid md:grid-cols-2 gap-2">
			<Fieldset>
				<TextField field={fields.name} />
				<NumberField.UndefinedOrInteger field={fields.age} />
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

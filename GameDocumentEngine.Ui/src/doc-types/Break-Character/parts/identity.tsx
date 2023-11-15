import type { Character } from '../character-types';
import { useFormFields } from '@/utils/form';
import { NumberField } from '@/components/form-fields/text-input/number-field';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { TextField } from '@/components/form-fields/text-input/text-field';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import { TextareaField } from '@/components/form-fields/textarea-input/textarea-field';
import { SelectField } from '@/components/form-fields/select-input/select-field';

const sizes = [
	undefined,
	'tiny',
	'small',
	'medium',
	'large',
	'massive',
	'colossal',
] as const;

export function Identity({ form }: GameObjectFormComponent<Character>) {
	const fields = useFormFields(form, {
		name: ['name'],
		calling: ['details', 'identity', 'calling'],
		rank: ['details', 'identity', 'rank'],
		species: ['details', 'identity', 'species'],
		size: ['details', 'identity', 'size'],
		homeland: ['details', 'identity', 'homeland'],
		languages: ['details', 'identity', 'languages'],
		history: ['details', 'identity', 'history'],
		purviews: ['details', 'identity', 'purviews'],
		description: ['details', 'identity', 'description'],
	});

	return (
		<div className="flex flex-col md:grid md:grid-cols-2 gap-2">
			<Fieldset>
				<TextField field={fields.name} />
				<TextField.AllowUndefined field={fields.calling} />
				<NumberField.UndefinedOrInteger field={fields.rank} />
				<TextField.AllowUndefined field={fields.species} />
				<SelectField field={fields.size} items={sizes}>
					{(s) => s && fields.size.translation(s)}
				</SelectField>
				<TextField.AllowUndefined field={fields.homeland} />
				{/* <TextField.AllowUndefined field={fields.languages} /> */}
				<TextField.AllowUndefined field={fields.history} />
				<TextareaField.AllowUndefined field={fields.purviews} />
				<TextareaField.AllowUndefined field={fields.description} />
			</Fieldset>
		</div>
	);
}

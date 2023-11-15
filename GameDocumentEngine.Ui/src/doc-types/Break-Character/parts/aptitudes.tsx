import type { Character } from '../character-types';
import type { FormFieldReturnType } from '@/utils/form';
import { useFormFields } from '@/utils/form';
import { NumberField } from '@/components/form-fields/text-input/number-field';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import { TextareaField } from '@/components/form-fields/textarea-input/textarea-field';
import { Prose } from '@/components/text/common';

export function Aptitudes({ form }: GameObjectFormComponent<Character>) {
	const fields = useFormFields(form, {
		might: ['details', 'aptitudes', 'might'],
		deftness: ['details', 'aptitudes', 'deftness'],
		grit: ['details', 'aptitudes', 'grit'],
		insight: ['details', 'aptitudes', 'insight'],
		aura: ['details', 'aptitudes', 'aura'],
	});

	return (
		<div className="flex flex-col md:grid md:grid-cols-2 gap-2">
			<Fieldset>
				<Aptitude field={fields.might} />
				<Aptitude field={fields.deftness} />
				<Aptitude field={fields.grit} />
				<Aptitude field={fields.insight} />
				<Aptitude field={fields.aura} />
			</Fieldset>
		</div>
	);
}

function Aptitude({
	field,
}: {
	field: FormFieldReturnType<Character['aptitudes']['might']>;
}) {
	const fields = useFormFields(field, {
		base: ['base'],
		trait: ['trait'],
		total: ['total'],
		modifiers: ['modifiers'],
	});

	return (
		<div>
			<h3>{field.translation('sectionHeader')}</h3>
			<Prose>{field.translation('sectionHint')}</Prose>
			<NumberField.Integer field={fields.base} />
			<NumberField.Integer field={fields.trait} />
			<NumberField.Integer field={fields.total} />
			<TextareaField field={fields.modifiers} />
		</div>
	);
}

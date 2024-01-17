import type { Character } from '../character-types';
import type { FieldMapping, FormFieldReturnType } from '@/utils/form';
import { useFormFields } from '@/utils/form';
import { NumberField } from '@/components/form-fields/text-input/number-field';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { TextField } from '@/components/form-fields/text-input/text-field';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import { TextareaField } from '@/components/form-fields/textarea-input/textarea-field';
import { SelectField } from '@/components/form-fields/select-input/select-field';
import { BasicList, BasicListItem } from './BasicList';
import {
	RichTextField,
	upgradingRichTextMapping,
} from '@/components/rich-text';

const sizes = [
	undefined,
	'tiny',
	'small',
	'medium',
	'large',
	'massive',
	'colossal',
] as const;

export const languageFixup: FieldMapping<string[] | undefined, string[]> = {
	toForm(networkValue) {
		return networkValue ?? [];
	},
	fromForm(currentValue) {
		return currentValue.length === 0 ? undefined : currentValue;
	},
};

export function Identity({ form }: GameObjectFormComponent<Character>) {
	const fields = useFormFields(form, {
		name: ['name'],
		calling: ['details', 'identity', 'calling'],
		rank: ['details', 'identity', 'rank'],
		species: ['details', 'identity', 'species'],
		size: ['details', 'identity', 'size'],
		homeland: ['details', 'identity', 'homeland'],
		languages: {
			path: ['details', 'identity', 'languages'],
			mapping: languageFixup,
		},
		history: ['details', 'identity', 'history'],
		purviews: ['details', 'identity', 'purviews'],
		description: {
			path: ['details', 'identity', 'description'],
			mapping: upgradingRichTextMapping,
		},
		currentXp: ['details', 'xp', 'current'],
		nextRank: ['details', 'xp', 'nextRank'],
	});

	return (
		<div className="flex flex-col md:grid md:grid-cols-2 gap-2">
			<Fieldset>
				<TextField field={fields.name} />
				<TextField.AllowUndefined field={fields.calling} />
				<NumberField.UndefinedOrInteger field={fields.rank} />
				<TextField.AllowUndefined field={fields.species} />
				<SelectField field={fields.size} items={sizes}>
					{(s) => (s ? fields.size.translation(s) : '-')}
				</SelectField>
				<TextField.AllowUndefined field={fields.homeland} />
				<section className="contents">
					<h3 className="text-lg">{fields.languages.translation('title')}</h3>
					<BasicList
						field={fields.languages}
						defaultValue=""
						fieldComponent={LanguageField}
					/>
				</section>
				<TextField.AllowUndefined field={fields.history} />
				<TextareaField.AllowUndefined field={fields.purviews} />
				<RichTextField field={fields.description} />
				<NumberField.Integer field={fields.currentXp} />
				<NumberField.Integer field={fields.nextRank} />
			</Fieldset>
		</div>
	);
}

function LanguageField({
	field,
	onRemove,
}: {
	field: FormFieldReturnType<string>;
	onRemove: () => void;
}) {
	return (
		<BasicListItem onRemove={onRemove}>
			<TextField field={field} className="flex-1" />
		</BasicListItem>
	);
}

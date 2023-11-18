import type { Character } from '../character-types';
import type { FormFieldReturnType } from '@/utils/form';
import { useFormFields } from '@/utils/form';
import { NumberField } from '@/components/form-fields/text-input/number-field';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import { TextareaField } from '@/components/form-fields/textarea-input/textarea-field';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { BasicList } from './BasicList';
import { IconButton } from '@/components/button/icon-button';
import { HiMinus } from 'react-icons/hi2';
import styles from './ability.module.css';

type Ability = {
	name: string;
	description: string;
	page?: number | undefined;
};
const defaultAbility: Ability = {
	name: '',
	description: '',
	page: undefined,
};

export function Abilities({ form }: GameObjectFormComponent<Character>) {
	const fields = useFormFields(form, {
		quirk: ['details', 'quirk'],
		abilities: ['details', 'abilities'],
		ability: (item: number) => ['details', 'abilities', item] as const,
	});

	return (
		<div className="flex flex-col md:grid md:grid-cols-2 gap-2">
			<Fieldset>
				<TextareaField field={fields.quirk} />
				<hr />
				<h3 className="text-lg">{fields.abilities.translation('title')}</h3>
				<BasicList
					field={fields.abilities}
					defaultValue={defaultAbility}
					fieldComponent={AbilityField}
				/>
			</Fieldset>
		</div>
	);
}

function AbilityField({
	field,
	onRemove,
}: {
	field: FormFieldReturnType<Ability>;
	onRemove: () => void;
}) {
	const fields = useFormFields(field, {
		name: ['name'],
		description: ['description'],
		page: ['page'],
	});
	return (
		<div className={styles.ability}>
			<TextField className={styles.abilityName} field={fields.name} />
			<NumberField.UndefinedOrInteger
				className={styles.abilityPage}
				field={fields.page}
			/>
			<TextareaField
				className={styles.abilityDescription}
				field={fields.description}
			/>
			<IconButton.Destructive
				onClick={onRemove}
				className={styles.removeButton}
			>
				<HiMinus />
			</IconButton.Destructive>
		</div>
	);
}

import { LuSword } from 'react-icons/lu';
import { NumberField } from '@/components/form-fields/text-input/number-field';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import type { Character } from '../../character-types';
import {
	CardBase,
	CardContents,
	CardHint,
	CardIcon,
	CardTitle,
	Container,
} from './atoms';
import { BasicList } from '../BasicList';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { IconButton } from '@/components/button/icon-button';
import { HiMinus } from 'react-icons/hi2';
import styles from './attack.module.css';
import { CircularNumberField } from '../CircularNumberField';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';

export function Attack({
	form,
}: Pick<GameObjectFormComponent<Character>, 'form'>) {
	const fields = useFormFields(form, {
		attack: ['details', 'combatValues', 'attack'],
	});

	return <AttackFields form={fields.attack} />;
}

type Weapon = {
	name?: string | undefined;
	bonuses?: string | undefined;
	extraDamage?: number | undefined;
	attackBonus?: number | undefined;
};
const newWeapon: Weapon = {};

export function AttackFields({
	form,
}: {
	form: FormFieldReturnType<Character['combatValues']['attack']>;
}) {
	const fields = useFormFields(form, {
		attackBonus: ['attackBonus'],
		weapons: ['weapons'],
	});

	return (
		<Container>
			<CardIcon icon={LuSword} />
			<CardTitle>{form.translation('title')}</CardTitle>
			<CardHint>{form.translation('hint')}</CardHint>
			<CardBase>
				<CircularNumberField field={fields.attackBonus} />
			</CardBase>

			<CardContents>
				<Fieldset>
					<h3 className="text-lg">{fields.weapons.translation('title')}</h3>
					<BasicList
						defaultValue={newWeapon}
						field={fields.weapons}
						fieldComponent={WeaponField}
					/>
				</Fieldset>
			</CardContents>
		</Container>
	);
}

function WeaponField({
	field,
	onRemove,
}: {
	field: FormFieldReturnType<Weapon>;
	onRemove: () => void;
}) {
	const fields = useFormFields(field, {
		name: ['name'],
		bonuses: ['bonuses'],
		extraDamage: ['extraDamage'],
		attackBonus: ['attackBonus'],
	});
	return (
		<div className={styles.weapon}>
			<TextField.AllowUndefined field={fields.name} className={styles.name} />
			<TextField.AllowUndefined
				field={fields.bonuses}
				className={styles.bonuses}
			/>
			<NumberField.UndefinedOrInteger
				field={fields.extraDamage}
				className={styles.extraDamage}
			/>
			<NumberField.UndefinedOrInteger
				field={fields.attackBonus}
				className={styles.attackBonus}
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

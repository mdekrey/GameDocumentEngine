import { LuSword } from 'react-icons/lu';
import { NumberField } from '@/components/form-fields/text-input/number-field';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import type { Character } from '../../character-types';
import { CardHint, CardTitle, Container } from './atoms';
import { BasicList } from '../BasicList';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { IconButton } from '@/components/button/icon-button';
import { HiMinus } from 'react-icons/hi2';

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
			<LuSword />
			<CardTitle>{form.translation('title')}</CardTitle>
			<CardHint>{form.translation('hint')}</CardHint>
			<NumberField.Integer field={fields.attackBonus} />
			<BasicList
				defaultValue={newWeapon}
				field={fields.weapons}
				fieldComponent={WeaponField}
			/>
			{/* TODO: weapons */}
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
		<div>
			<TextField.AllowUndefined field={fields.name} />
			<TextField.AllowUndefined field={fields.bonuses} />
			<NumberField.UndefinedOrInteger field={fields.extraDamage} />
			<NumberField.UndefinedOrInteger field={fields.attackBonus} />
			<IconButton.Destructive onClick={onRemove}>
				<HiMinus />
			</IconButton.Destructive>
		</div>
	);
}

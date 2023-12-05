import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { Character } from '../character-types';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { NumberField } from '@/components/form-fields/text-input/number-field';
import { TextareaField } from '@/components/form-fields/textarea-input/textarea-field';
import { BasicList, BasicListItem } from './BasicList';
import { CircularNumberField } from './CircularNumberField';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';

const defaultInventoryItem = '';

export function Gear({ form }: GameObjectFormComponent<Character>) {
	const fields = useFormFields(form, {
		worn: ['details', 'gear', 'worn'],
		slotsBase: ['details', 'gear', 'slotsBase'],
		slotsTotal: ['details', 'gear', 'slotsTotal'],
		slotsModifiers: ['details', 'gear', 'slotsModifiers'],
		inventory: ['details', 'gear', 'inventory'],
		stones: ['details', 'wealth', 'stones'],
		coins: ['details', 'wealth', 'coins'],
		gems: ['details', 'wealth', 'gems'],
	});

	return (
		<Fieldset>
			<TextField field={fields.worn} />
			<div className="flex flex-row gap-4">
				<h3 className="text-lg flex-1">
					{fields.inventory.translation('section-heading')}
				</h3>
				<CircularNumberField field={fields.slotsBase} />
			</div>
			<div className="flex flex-row gap-4">
				<CircularNumberField.Main field={fields.slotsTotal} />
				<TextareaField field={fields.slotsModifiers} className="flex-1" />
			</div>
			<BasicList
				field={fields.inventory}
				defaultValue={defaultInventoryItem}
				fieldComponent={InventoryItemField}
			/>
			<div className="grid grid-cols-3 gap-4">
				<NumberField.Integer field={fields.stones} />
				<NumberField.Integer field={fields.coins} />
				<NumberField.Integer field={fields.gems} />
			</div>
		</Fieldset>
	);
}

function InventoryItemField({
	field,
	onRemove,
}: {
	field: FormFieldReturnType<string>;
	onRemove: () => void;
}) {
	return (
		<BasicListItem onRemove={onRemove}>
			<TextareaField field={field} className="flex-1" inputClassName="h-10" />
		</BasicListItem>
	);
}

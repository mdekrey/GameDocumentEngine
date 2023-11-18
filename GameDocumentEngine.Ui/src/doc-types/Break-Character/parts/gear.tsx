import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { Character } from '../character-types';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { NumberField } from '@/components/form-fields/text-input/number-field';
import { TextareaField } from '@/components/form-fields/textarea-input/textarea-field';
import { BasicList } from './BasicList';
import { HiMinus } from 'react-icons/hi2';
import { IconButton } from '@/components/button/icon-button';

const defaultInventoryItem = '';

export function Gear({ form }: GameObjectFormComponent<Character>) {
	const fields = useFormFields(form, {
		worn: ['details', 'gear', 'worn'],
		slotsBase: ['details', 'gear', 'slotsBase'],
		slotsTotal: ['details', 'gear', 'slotsTotal'],
		slotsModifiers: ['details', 'gear', 'slotsModifiers'],
		inventory: ['details', 'gear', 'inventory'],
		inventoryItem: (index: number) =>
			['details', 'gear', 'inventory', index] as const,
	});

	return (
		<>
			<TextField field={fields.worn} />
			<NumberField.Integer field={fields.slotsBase} />
			<NumberField.Integer field={fields.slotsTotal} />
			<TextareaField field={fields.slotsModifiers} />
			<BasicList
				field={fields.inventory}
				defaultValue={defaultInventoryItem}
				fieldComponent={InventoryItemField}
			/>
		</>
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
		<div>
			<TextField field={field} />
			<IconButton.Destructive onClick={onRemove}>
				<HiMinus />
			</IconButton.Destructive>
		</div>
	);
}

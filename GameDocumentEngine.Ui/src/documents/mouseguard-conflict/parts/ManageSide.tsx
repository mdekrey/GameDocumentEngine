import { useFormFields } from '@/utils/form/useFormFields';
import { ActionChoice, SideState } from '../conflict-types';
import attackCard from '@/documents/mouseguard-assets/deck/ActionDeckattack.webp';
import defendCard from '@/documents/mouseguard-assets/deck/ActionDeckdefend.webp';
import feintCard from '@/documents/mouseguard-assets/deck/ActionDeckfeint.webp';
import maneuverCard from '@/documents/mouseguard-assets/deck/ActionDeckmaneuver.webp';
import { FormFieldReturnType } from '@/utils/form/useForm';
import { SelectField } from '@/components/form-fields/select-input/select-field';
import { ButtonRow } from '@/components/button/button-row';
import { ToggleButtonField } from '@/components/form-fields/toggle-button/toggle-button-field';
import { FieldMapping } from '@/utils/form/useField';
import { atom } from 'jotai';

const cards = {
	attack: attackCard,
	defend: defendCard,
	feint: feintCard,
	maneuver: maneuverCard,
};

const defaultNullActionChoice: FieldMapping<
	ActionChoice | undefined,
	ActionChoice | null
> = {
	toForm: (v) => v ?? null,
	fromForm: (v) => v ?? undefined,
};

const defaultFalse: FieldMapping<boolean | undefined, boolean> = {
	toForm: (v) => !!v,
	fromForm: (v) => v,
};

export function ManageSide({ side }: { side: FormFieldReturnType<SideState> }) {
	const fields = useFormFields(side, {
		choices: ['choices'],
		choice: (index: 0 | 1 | 2) =>
			({
				path: ['choices', index],
				disabled: () => atom((get) => !!get(side.value).ready),
				mapping: defaultNullActionChoice,
			}) as const,
		ready: {
			path: ['ready'],
			mapping: defaultFalse,
			disabled: () =>
				atom((get) => {
					const choices = get(side.value).choices;
					return choices.length !== 3 || choices.some((v) => !v);
				}),
		},
	});
	return (
		<>
			<div className="flex flex-col md:flex-row gap-2">
				<div className="contents">
					<SelectAction action={fields.choice(0)} />
					<SelectAction action={fields.choice(1)} />
					<SelectAction action={fields.choice(2)} />
				</div>
				<ButtonRow className="md:self-center">
					<ToggleButtonField field={fields.ready} />
				</ButtonRow>
			</div>
		</>
	);
}

function SelectAction({
	action,
}: {
	action: FormFieldReturnType<ActionChoice | null>;
}) {
	return (
		<SelectField
			field={action}
			items={Object.keys(cards) as (keyof typeof cards)[]}
			children={(item) =>
				item ? (
					<img
						className="inline-block w-48"
						src={cards[item]}
						alt={action.translation(item)}
						title={action.translation(item)}
					/>
				) : (
					action.translation('not-selected')
				)
			}
		/>
	);
}

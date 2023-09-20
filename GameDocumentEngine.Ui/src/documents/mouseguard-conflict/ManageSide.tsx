import { useFormFields } from '@/utils/form/useFormFields';
import { ActionChoice, SideState } from './conflict-types';
import attackCard from '@/documents/mouseguard-assets/deck/ActionDeckattack.webp';
import defendCard from '@/documents/mouseguard-assets/deck/ActionDeckdefend.webp';
import feintCard from '@/documents/mouseguard-assets/deck/ActionDeckfeint.webp';
import maneuverCard from '@/documents/mouseguard-assets/deck/ActionDeckmaneuver.webp';
import { FormFieldReturnType } from '@/utils/form/useForm';
import { SelectField } from '@/components/form-fields/select-input/select-field';
import { ButtonRow } from '@/components/button/button-row';
import { ToggleButtonField } from '@/components/form-fields/toggle-button/toggle-button-field';
import { FieldMapping } from '@/utils/form/useField';

const cards = {
	attack: attackCard,
	defend: defendCard,
	feint: feintCard,
	maneuver: maneuverCard,
};

const defaultFalse: FieldMapping<boolean | undefined, boolean> = {
	toForm: (v) => !!v,
	fromForm: (v) => v,
};

export function ManageSide({ side }: { side: FormFieldReturnType<SideState> }) {
	const fields = useFormFields(side, {
		choice: (index: 0 | 1 | 2) => ['choices', index] as const,
		ready: { path: ['ready'], mapping: defaultFalse },
	});
	// TODO: allow changing ready if there are no choices errors
	// TODO: allow changing choice only if ready is false
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
	action: FormFieldReturnType<ActionChoice>;
}) {
	return (
		<SelectField
			field={action}
			items={Object.keys(cards) as (keyof typeof cards)[]}
			children={(item) => (
				<img className="inline-block w-48" src={cards[item]} />
			)}
		/>
	);
}

import { useFormFields } from '@/utils/form/useFormFields';
import { SideState } from './conflict-types';
import attackCard from '@/documents/mouseguard-assets/deck/ActionDeckattack.webp';
import defendCard from '@/documents/mouseguard-assets/deck/ActionDeckdefend.webp';
import feintCard from '@/documents/mouseguard-assets/deck/ActionDeckfeint.webp';
import maneuverCard from '@/documents/mouseguard-assets/deck/ActionDeckmaneuver.webp';
import { FormFieldReturnType } from '@/utils/form/useForm';
import { SelectField } from '@/components/form-fields/select-input/select-field';

const cards = {
	attack: attackCard,
	defend: defendCard,
	feint: feintCard,
	maneuver: maneuverCard,
};

export function ManageSide({ side }: { side: FormFieldReturnType<SideState> }) {
	const fields = useFormFields(side, {
		choice: (index: 0 | 1 | 2) =>
			({ path: ['choices', index], translationPath: ['choices'] }) as const,
		ready: ['ready'],
	});
	return (
		<div className="flex flex-col md:flex-row gap-2">
			<SelectField
				field={fields.choice(0)}
				items={Object.keys(cards) as (keyof typeof cards)[]}
				children={(item) => (
					<img className="inline-block w-48" src={cards[item]} />
				)}
			/>
			<SelectField
				field={fields.choice(1)}
				items={Object.keys(cards) as (keyof typeof cards)[]}
				children={(item) => (
					<img className="inline-block w-48" src={cards[item]} />
				)}
			/>

			<SelectField
				field={fields.choice(2)}
				items={Object.keys(cards) as (keyof typeof cards)[]}
				children={(item) => (
					<img className="inline-block w-48" src={cards[item]} />
				)}
			/>
		</div>
	);
}

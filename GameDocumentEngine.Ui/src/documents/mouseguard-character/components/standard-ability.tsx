import type { FormFieldReturnType } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import { TextField } from '@/components/form-fields/text-input/text-field';
import type { Atom } from 'jotai';
import { AbilityLayout } from './ability-layout';

export function StandardAbility({
	ability,
	padToCount,
}: {
	ability: FormFieldReturnType<{
		advancement: {
			passes: number;
			fails: number;
		};
		rating: number;
	}>;
	padToCount: Atom<number>;
}) {
	const fields = useFormFields(ability, {
		rating: ['rating'],
		advancement: ['advancement'],
	});

	return (
		<AbilityLayout
			advancement={fields.advancement}
			baseField={ability}
			passFailMaxRating={fields.rating.value}
			passFailPadding={padToCount}
		>
			<AbilityLayout.Rating>
				<TextField.Integer
					contentsClassName="w-10"
					labelClassName="sr-only"
					inputClassName="text-center"
					field={fields.rating}
				/>
			</AbilityLayout.Rating>
		</AbilityLayout>
	);
}

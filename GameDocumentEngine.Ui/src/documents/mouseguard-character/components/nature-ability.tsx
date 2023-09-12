import type { FormFieldReturnType } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import type { CharacterDocument } from '../character-types';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { atom } from 'jotai';
import { AbilityLayout } from './ability-layout';

const naturePadding = atom(() => 6);

export function NatureAbility({
	nature,
}: {
	nature: FormFieldReturnType<
		CharacterDocument['details']['abilities']['nature']
	>;
}) {
	const fields = useFormFields(nature, {
		current: ['current'],
		max: ['max'],
		advancement: ['advancement'],
	});

	return (
		<AbilityLayout
			advancement={fields.advancement}
			baseField={nature}
			passFailMaxRating={fields.max.value}
			passFailPadding={naturePadding}
		>
			<AbilityLayout.Rating>
				<TextField.Integer
					contentsClassName="w-10"
					labelClassName="sr-only"
					inputClassName="text-center"
					field={fields.current}
				/>
				/
				<TextField.Integer
					contentsClassName="w-10"
					labelClassName="sr-only"
					inputClassName="text-center"
					field={fields.max}
				/>
			</AbilityLayout.Rating>
		</AbilityLayout>
	);
}

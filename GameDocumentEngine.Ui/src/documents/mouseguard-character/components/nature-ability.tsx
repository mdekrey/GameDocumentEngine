import { FormFieldReturnType } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import { CharacterDocument } from '../character-types';
import { TextField } from '@/utils/form-fields/text-field/text-field';
import { PassFail } from './pass-fail';
import { atom } from 'jotai';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';

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

	const maxMinusOne = useComputedAtom((get) => get(fields.max.value) - 1);

	return (
		<div className="flex flex-row col-span-2 gap-2">
			<div className="text-xl font-bold self-center flex-1">
				{nature.translation(['label'])}
			</div>
			<div className="flex flex-row gap-2 items-center">
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
			</div>
			<PassFail
				advancement={fields.advancement}
				maxPasses={fields.max.value}
				maxFails={maxMinusOne}
				padToCount={naturePadding}
			/>
		</div>
	);
}

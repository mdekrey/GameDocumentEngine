import { FormFieldReturnType } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import { TextField } from '@/components/form-fields/text-field/text-field';
import { PassFail } from './pass-fail';
import { Atom } from 'jotai';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';

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
	const ratingMinusOne = useComputedAtom((get) => get(fields.rating.value) - 1);

	return (
		<div className="flex flex-row col-span-2 gap-2">
			<div className="text-xl font-bold self-center flex-1">
				{ability.translation(['label'])}
			</div>
			<div className="flex flex-row gap-2 items-center">
				<TextField.Integer
					contentsClassName="w-10"
					labelClassName="sr-only"
					inputClassName="text-center"
					field={fields.rating}
				/>
			</div>
			<PassFail
				advancement={fields.advancement}
				maxPasses={fields.rating.value}
				maxFails={ratingMinusOne}
				padToCount={padToCount}
			/>
		</div>
	);
}

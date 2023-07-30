import { FormFieldReturnType, useFormFields } from '@/utils/form/useForm';
import { TextField } from '@/utils/form/text-field/text-field';
import { PassFail } from './pass-fail';

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
	padToCount: number;
}) {
	const fields = useFormFields(ability, {
		rating: ['rating'],
		advancement: ['advancement'],
	});
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
				rating={fields.rating.valueAtom}
				padToCount={padToCount}
			/>
		</div>
	);
}

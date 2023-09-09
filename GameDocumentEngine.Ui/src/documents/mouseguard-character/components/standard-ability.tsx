import type { FormFieldReturnType } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import { TextField } from '@/components/form-fields/text-input/text-field';
import type { Atom } from 'jotai';
import { AbilityLayout } from './ability-layout';
import { DocumentPointers } from '@/documents/get-document-pointers';

export function StandardAbility({
	ability,
	padToCount,
	writablePointers,
}: {
	ability: FormFieldReturnType<{
		advancement: {
			passes: number;
			fails: number;
		};
		rating: number;
	}>;
	padToCount: Atom<number>;
	writablePointers: DocumentPointers;
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
			readOnly={!writablePointers.contains('rating')}
		>
			<AbilityLayout.Rating>
				<TextField.Integer
					contentsClassName="w-10"
					labelClassName="sr-only"
					inputClassName="text-center"
					field={fields.rating}
					readOnly={!writablePointers.contains('rating')}
				/>
			</AbilityLayout.Rating>
		</AbilityLayout>
	);
}

import type { FormFieldReturnType } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import type { CharacterDocument } from '../character-types';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { atom } from 'jotai';
import { AbilityLayout } from './ability-layout';
import { DocumentPointers } from '@/documents/get-document-pointers';

const naturePadding = atom(() => 6);

export function NatureAbility({
	nature,
	writablePointers,
}: {
	nature: FormFieldReturnType<
		CharacterDocument['details']['abilities']['nature']
	>;
	writablePointers: DocumentPointers;
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
			readOnly={!writablePointers.contains('advancement')}
		>
			<AbilityLayout.Rating>
				<TextField.Integer
					contentsClassName="w-10"
					labelClassName="sr-only"
					inputClassName="text-center"
					field={fields.current}
					readOnly={!writablePointers.contains('current')}
				/>
				/
				<TextField.Integer
					contentsClassName="w-10"
					labelClassName="sr-only"
					inputClassName="text-center"
					field={fields.max}
					readOnly={!writablePointers.contains('max')}
				/>
			</AbilityLayout.Rating>
		</AbilityLayout>
	);
}

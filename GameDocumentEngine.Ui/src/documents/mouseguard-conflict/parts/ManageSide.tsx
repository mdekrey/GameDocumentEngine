import { useFormFields } from '@/utils/form/useFormFields';
import { SideState } from '../conflict-types';
import { FormFieldReturnType } from '@/utils/form/useForm';
import { ButtonRow } from '@/components/button/button-row';
import { ToggleButtonField } from '@/components/form-fields/toggle-button/toggle-button-field';
import { FieldMapping } from '@/utils/form/useField';
import { atom } from 'jotai';
import { SelectAction, defaultNullActionChoice } from './CardSelect';

const defaultFalse: FieldMapping<boolean | undefined, boolean> = {
	toForm: (v) => !!v,
	fromForm: (v) => v,
};

export function ManageSide({
	side,
	translation,
}: {
	side: FormFieldReturnType<SideState>;
	translation: (key: string) => string;
}) {
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
					<SelectAction action={fields.choice(0)} translation={translation} />
					<SelectAction action={fields.choice(1)} translation={translation} />
					<SelectAction action={fields.choice(2)} translation={translation} />
				</div>
				<ButtonRow className="md:self-center">
					<ToggleButtonField field={fields.ready} />
				</ButtonRow>
			</div>
		</>
	);
}

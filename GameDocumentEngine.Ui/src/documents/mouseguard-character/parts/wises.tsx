import { HiCheck, HiXMark } from 'react-icons/hi2';
import { FormFieldReturnType, UseFormResult } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import { CharacterDocument, Wise, wiseSchema } from '../character-types';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { FieldMapping } from '@/utils/form/useField';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { ToggleButtonField } from '@/components/form-fields/toggle-button/toggle-button-field';

const requiredWiseMapping: FieldMapping<Wise | null, Wise> = {
	toForm: (v) =>
		v ?? { name: '', rating: 0, advancement: { passes: 0, fails: 0 } },
	fromForm: (v) =>
		!v.pass && !v.fail && !v.persona && !v.fate && !v.name ? null : v,
};

export function Wises({ form }: { form: UseFormResult<CharacterDocument> }) {
	const fields = useFormFields(form, {
		wises: (wiseIndex: number) =>
			({
				path: ['details', 'wises', wiseIndex],
				mapping: requiredWiseMapping,
				schema: wiseSchema,
				translationPath: ['details', 'wises'],
			}) as const,
	});

	return (
		<div className="flex flex-col md:grid md:grid-cols-2 gap-2">
			<Fieldset>
				{Array(2)
					.fill(0)
					.map((_, index) => (
						<Wise key={index} wise={fields.wises(index)} />
					))}
			</Fieldset>
			<Fieldset>
				{Array(2)
					.fill(0)
					.map((_, index) => (
						<Wise key={index} wise={fields.wises(index + 2)} />
					))}
			</Fieldset>
		</div>
	);
}

const optionalToBoolMapping: FieldMapping<boolean | undefined, boolean> = {
	toForm: (v) => v || false,
	fromForm: (v) => v || undefined,
};

export function Wise({ wise }: { wise: FormFieldReturnType<Wise> }) {
	const fields = useFormFields(wise, {
		name: ['name'],
		pass: { path: ['pass'], mapping: optionalToBoolMapping },
		fail: { path: ['fail'], mapping: optionalToBoolMapping },
		persona: { path: ['persona'], mapping: optionalToBoolMapping },
		fate: { path: ['fate'], mapping: optionalToBoolMapping },
	});

	fields.pass.value;

	return (
		<div className="flex flex-row col-span-2 gap-2">
			<TextField
				labelClassName="sr-only"
				className="block flex-1"
				field={fields.name}
			/>
			<WiseToggleButton field={fields.pass} />
			<WiseToggleButton field={fields.fail} />
			<WiseToggleButton field={fields.fate} />
			<WiseToggleButton field={fields.persona} />
		</div>
	);
}

function WiseToggleButton({ field }: { field: FormFieldReturnType<boolean> }) {
	return (
		<ToggleButtonField
			field={field}
			pressedContents={
				<span className="flex flex-row gap-2 items-center">
					<HiCheck />
					{field.translation('label')}
				</span>
			}
			unpressedContents={
				<span className="flex flex-row gap-2 items-center">
					<HiXMark />
					{field.translation('label')}
				</span>
			}
		/>
	);
}

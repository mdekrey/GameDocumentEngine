import { HiCheck, HiXMark } from 'react-icons/hi2';
import type { FormFieldReturnType, UseFormResult } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import type { CharacterDocument } from '../character-types';
import { type Wise, wiseSchema } from '../character-types';
import { TextField } from '@/components/form-fields/text-input/text-field';
import type { FieldMapping } from '@/utils/form/useField';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { ToggleButtonField } from '@/components/form-fields/toggle-button/toggle-button-field';
import { DocumentPointers } from '@/documents/get-document-pointers';

const requiredWiseMapping: FieldMapping<Wise | null, Wise> = {
	toForm: (v) =>
		v ?? { name: '', rating: 0, advancement: { passes: 0, fails: 0 } },
	fromForm: (v) =>
		!v.pass && !v.fail && !v.persona && !v.fate && !v.name ? null : v,
};

export function Wises({
	form,
	writablePointers,
}: {
	form: UseFormResult<CharacterDocument>;
	writablePointers: DocumentPointers;
}) {
	const fields = useFormFields(form, {
		wises: (wiseIndex: number) =>
			({
				path: ['details', 'wises', wiseIndex],
				mapping: requiredWiseMapping,
				schema: wiseSchema,
				translationPath: ['details', 'wises'],
			}) as const,
	});
	const wises = writablePointers.navigate('details', 'wises');

	return (
		<div className="flex flex-col md:grid md:grid-cols-2 gap-2">
			<Fieldset>
				{Array(2)
					.fill(0)
					.map((_, index) => (
						<Wise
							key={index}
							wise={fields.wises(index)}
							writablePointers={wises.navigate(index)}
						/>
					))}
			</Fieldset>
			<Fieldset>
				{Array(2)
					.fill(0)
					.map((_, index) => (
						<Wise
							key={index}
							wise={fields.wises(index + 2)}
							writablePointers={wises.navigate(index + 2)}
						/>
					))}
			</Fieldset>
		</div>
	);
}

const optionalToBoolMapping: FieldMapping<boolean | undefined, boolean> = {
	toForm: (v) => v || false,
	fromForm: (v) => v || undefined,
};

export function Wise({
	wise,
	writablePointers,
}: {
	wise: FormFieldReturnType<Wise>;
	writablePointers: DocumentPointers;
}) {
	const fields = useFormFields(wise, {
		name: ['name'],
		pass: { path: ['pass'], mapping: optionalToBoolMapping },
		fail: { path: ['fail'], mapping: optionalToBoolMapping },
		persona: { path: ['persona'], mapping: optionalToBoolMapping },
		fate: { path: ['fate'], mapping: optionalToBoolMapping },
	});
	const hasBasePath = writablePointers.contains();

	return (
		<div className="flex flex-row flex-wrap gap-2">
			<TextField
				labelClassName="sr-only"
				className="block flex-1 min-w-fit w-64"
				field={fields.name}
				readOnly={!hasBasePath && !writablePointers.contains('name')}
			/>
			<div className="flex flex-row gap-2 justify-end flex-1">
				<WiseToggleButton
					field={fields.pass}
					readOnly={!hasBasePath && !writablePointers.contains('pass')}
				/>
				<WiseToggleButton
					field={fields.fail}
					readOnly={!hasBasePath && !writablePointers.contains('fail')}
				/>
				<WiseToggleButton
					field={fields.fate}
					readOnly={!hasBasePath && !writablePointers.contains('fate')}
				/>
				<WiseToggleButton
					field={fields.persona}
					readOnly={!hasBasePath && !writablePointers.contains('persona')}
				/>
			</div>
		</div>
	);
}

function WiseToggleButton({
	field,
	readOnly,
}: {
	field: FormFieldReturnType<boolean>;
	readOnly?: boolean;
}) {
	return (
		<ToggleButtonField
			field={field}
			readOnly={readOnly}
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

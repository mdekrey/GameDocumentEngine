import type { EditableDocumentDetails } from '@/documents/defineDocument';
import type { FormFieldReturnType, UseFormResult } from '@/utils/form';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import type { Clock } from './clock-types';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { NumberField } from '@/components/form-fields/text-input/number-field';
import { useFormFields } from '@/utils/form';
import type { DocumentPointers } from '@/documents/get-document-pointers';
import { Section } from '@/components/sections';

export function ClockEdit({
	form,
	readablePointers,
}: {
	form: UseFormResult<EditableDocumentDetails<Clock>>;
	readablePointers: DocumentPointers;
}) {
	const formFields = useFormFields(form, {
		name: ['name'],
		details: ['details'],
	});

	return (
		<Section>
			<Fieldset>
				{readablePointers.contains('name') && (
					<TextField field={formFields.name} />
				)}
			</Fieldset>
			<ClockDetails
				templateField={formFields.details}
				hideCurrent={!readablePointers.contains('details', 'current')}
				hideMax={!readablePointers.contains('details', 'max')}
			/>
		</Section>
	);
}

export function ClockDetails({
	templateField,
	hideCurrent,
	hideMax,
}: {
	templateField: FormFieldReturnType<Clock>;
	hideCurrent?: boolean;
	hideMax?: boolean;
}) {
	const formFields = useFormFields(templateField, {
		current: ['current'],
		max: ['max'],
	});
	return (
		<Fieldset>
			{!hideCurrent && <NumberField.Integer field={formFields.current} />}
			{!hideMax && <NumberField.Integer field={formFields.max} />}
		</Fieldset>
	);
}

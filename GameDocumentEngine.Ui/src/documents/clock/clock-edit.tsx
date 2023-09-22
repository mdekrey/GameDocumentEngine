import type { EditableDocumentDetails } from '../defineDocument';
import type { UseFormResult } from '@/utils/form/useForm';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import type { Clock } from './clock-types';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { NumberField } from '@/components/form-fields/text-input/number-field';
import { useFormFields } from '@/utils/form/useFormFields';
import type { DocumentPointers } from '../get-document-pointers';

export function ClockEdit({
	form,
	readablePointers,
}: {
	form: UseFormResult<EditableDocumentDetails<Clock>>;
	readablePointers: DocumentPointers;
}) {
	const formFields = useFormFields(form, {
		name: ['name'],
		current: ['details', 'current'],
		max: ['details', 'max'],
	});

	return (
		<Fieldset>
			{readablePointers.contains('name') && (
				<TextField field={formFields.name} />
			)}
			{readablePointers.contains('details', 'current') && (
				<NumberField.Integer field={formFields.current} />
			)}
			{readablePointers.contains('details', 'max') && (
				<NumberField.Integer field={formFields.max} />
			)}
		</Fieldset>
	);
}

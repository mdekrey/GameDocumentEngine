import { ErrorsList } from '../errors/errors-list';
import { Field } from '../field/field';
import { TextInput } from '../text-input/text-input';
import { UseFieldResult } from '../useField';

export function NumberField({
	field,
}: {
	field: Omit<
		UseFieldResult<
			unknown,
			string,
			{ hasErrors: true; isCheckbox: false; hasTranslations: true }
		>,
		'valueAtom'
	>;
}) {
	return (
		<Field>
			<Field.Label>{field.translation(['label'])}</Field.Label>
			<Field.Contents>
				<TextInput type="number" {...field.standardProps} />
				<ErrorsList errors={field.errors} translations={field.translation} />
			</Field.Contents>
		</Field>
	);
}

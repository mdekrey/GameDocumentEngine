import { ErrorsList } from '../errors/errors-list';
import { Field } from '../field/field';
import { TextInput } from '../text-input/text-input';
import { UseFieldResult } from '../useField';

export function NumberField({
	field,
	translations: t,
}: {
	field: Omit<
		UseFieldResult<unknown, string, { hasErrors: true; isCheckbox: false }>,
		'valueAtom'
	>;
	translations: (key: string) => string;
}) {
	return (
		<Field>
			<Field.Label>{t('label')}</Field.Label>
			<Field.Contents>
				<TextInput type="number" {...field.standardProps} />
				<ErrorsList errors={field.errors} translations={t} />
			</Field.Contents>
		</Field>
	);
}

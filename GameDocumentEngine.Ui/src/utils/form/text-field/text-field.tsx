import { ErrorsList } from '../errors/errors-list';
import { Field } from '../field/field';
import { TextInput } from '../text-input/text-input';
import { FieldMapping, UseFieldResult } from '../useField';

export const undefinedAsEmptyStringMapping: FieldMapping<
	string | undefined,
	string
> = {
	toForm: (v: string | undefined) => v ?? '',
	fromForm: (v: string) => (v ? v : undefined),
};

export function TextField({
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
				<TextInput {...field.standardProps} />
				<ErrorsList errors={field.errors} translations={field.translation} />
			</Field.Contents>
		</Field>
	);
}

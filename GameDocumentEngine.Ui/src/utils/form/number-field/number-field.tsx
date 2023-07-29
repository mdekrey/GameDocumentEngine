import { ErrorsList } from '../errors/errors-list';
import { Field } from '../field/field';
import { TextInput } from '../text-input/text-input';
import { FieldMapping, UseFieldResult } from '../useField';

export const undefinedOrIntegerMapping: FieldMapping<
	number | undefined,
	string
> = {
	toForm: (v: number | undefined) => (v === undefined ? '' : v.toFixed(0)),
	fromForm: (v, setValue) => {
		if (!v) {
			setValue(undefined);
			return;
		}
		const result = Number.parseInt(v, 10);
		if (isNaN(result)) return;
		setValue(result);
	},
};

export const integerMapping: FieldMapping<number, string> = {
	toForm: (v: number) => v.toFixed(0),
	fromForm: (v, setValue) => {
		const result = Number.parseInt(v, 10);
		if (isNaN(result)) return;
		setValue(result);
	},
};

export function NumberField<TValue>({
	field,
	mapping,
}: {
	field: UseFieldResult<TValue, { hasErrors: true; hasTranslations: true }>;
	mapping: FieldMapping<TValue, string>;
}) {
	return (
		<Field>
			<Field.Label>{field.translation(['label'])}</Field.Label>
			<Field.Contents>
				<TextInput type="number" {...field.htmlProps(mapping)} />
				<ErrorsList errors={field.errors} translations={field.translation} />
			</Field.Contents>
		</Field>
	);
}

import { ErrorsList } from '../errors/errors-list';
import { Field } from '../field/field';
import { TextInput } from '../text-input/text-input';
import { FieldMapping, UseFieldResult } from '../useField';

export const undefinedAsEmptyStringMapping: FieldMapping<
	string | undefined,
	string
> = {
	toForm: (v: string | undefined) => v ?? '',
	fromForm: (v) => (v ? v : undefined),
};

export function TextField<TValue>({
	field,
}: {
	field: UseFieldResult<TValue, { hasErrors: true; hasTranslations: true }>;
	mapping: FieldMapping<TValue, string>;
}): React.ReactNode;
export function TextField({
	field,
}: {
	field: UseFieldResult<string, { hasErrors: true; hasTranslations: true }>;
}): React.ReactNode;
export function TextField<T>({
	field,
	mapping,
}: {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	field: UseFieldResult<T>;
	mapping?: FieldMapping<T, string>;
}) {
	return (
		<Field>
			<Field.Label>{field.translation(['label'])}</Field.Label>
			<Field.Contents>
				{/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
				<TextInput {...field.htmlProps(mapping!)} />
				<ErrorsList errors={field.errors} translations={field.translation} />
			</Field.Contents>
		</Field>
	);
}

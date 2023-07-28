import { useMemo } from 'react';
import { ErrorsList } from '../errors/errors-list';
import { Field } from '../field/field';
import { TextInput } from '../text-input/text-input';
import { FieldMapping, UseFieldResult } from '../useField';
import { mapAtom } from '../mapAtom';

export const undefinedAsEmptyStringMapping: FieldMapping<
	string | undefined,
	string
> = {
	toForm: (v: string | undefined) => v ?? '',
	fromForm: (v: string) => (v ? v : undefined),
};

export function TextField<TValue>({
	field,
}: {
	field: UseFieldResult<
		TValue,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		any,
		{ hasErrors: true; isCheckbox: false; hasTranslations: true }
	>;
	mapping: FieldMapping<TValue, string>;
}): React.ReactNode;
export function TextField({
	field,
}: {
	field: UseFieldResult<
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		any,
		string,
		{ hasErrors: true; isCheckbox: false; hasTranslations: true }
	>;
}): React.ReactNode;
export function TextField({
	field,
	mapping,
}: {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	field: UseFieldResult<any, any>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	mapping?: FieldMapping<any, any>;
}) {
	const internalValue = useMemo(
		() =>
			mapping
				? mapAtom(field.valueAtom, mapping.toForm, mapping.fromForm)
				: null,
		[field.valueAtom, mapping],
	);
	return (
		<Field>
			<Field.Label>{field.translation(['label'])}</Field.Label>
			<Field.Contents>
				{internalValue && mapping ? (
					<TextInput
						defaultValue={internalValue}
						onChange={(ev) =>
							field.onChange(mapping.fromForm(ev.currentTarget.value))
						}
						onBlur={field.onBlur}
					/>
				) : (
					<TextInput {...field.standardProps} />
				)}
				<ErrorsList errors={field.errors} translations={field.translation} />
			</Field.Contents>
		</Field>
	);
}

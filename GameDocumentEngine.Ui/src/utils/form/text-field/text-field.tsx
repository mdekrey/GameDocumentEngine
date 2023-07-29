import { ErrorsList } from '../errors/errors-list';
import { Field } from '../field/field';
import { TextInput } from '../text-input/text-input';
import { FieldMapping, UseFieldResult } from '../useField';
import { MappedFieldProps } from './MappedFieldProps';

export const undefinedAsEmptyStringMapping: FieldMapping<
	string | undefined,
	string
> = {
	toForm: (v: string | undefined) => v ?? '',
	fromForm: (v) => (v ? v : undefined),
};

type TextFieldPersistentProps = {
	description?: boolean;
};
export type TextFieldProps<TValue> = MappedFieldProps<TValue, string> &
	TextFieldPersistentProps;

export function TextField<T>(props: TextFieldProps<T>) {
	const htmlProps =
		'mapping' in props
			? props.field.htmlProps(props.mapping)
			: props.field.htmlProps();
	const {
		field: { translation: t, errors },
		description,
	} = props;
	return (
		<Field>
			<Field.Label>{t(['label'])}</Field.Label>
			<Field.Contents>
				<TextInput {...htmlProps} />
				{description && <p className="text-xs italic">{t(['description'])}</p>}
				<ErrorsList errors={errors} translations={t} />
			</Field.Contents>
		</Field>
	);
}

TextField.AllowUndefined = function TextFieldWithUndefined({
	field,
	...props
}: {
	field: UseFieldResult<
		string | undefined,
		{ hasErrors: true; hasTranslations: true }
	>;
} & TextFieldPersistentProps) {
	return (
		<TextField
			field={field}
			mapping={undefinedAsEmptyStringMapping}
			{...props}
		/>
	);
};

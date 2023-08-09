import { ErrorsList } from '@/utils/form-fields/jotai/errors/errors-list';
import { Field } from '@/utils/form-fields/field/field';
import { SelectInput } from '@/utils/form-fields/select-input/select-input';
import { UseFieldResult } from '@/utils/form/useField';

export function SelectField<T>({
	field,
	items,
	children,
}: {
	field: UseFieldResult<T, { hasErrors: true; hasTranslations: true }>;
	items: T[];
	children: (item: T) => React.ReactNode;
}) {
	return (
		<Field>
			<Field.Label>{field.translation(['label'])}</Field.Label>
			<Field.Contents>
				<SelectInput items={items} {...field.htmlProps.asControlled()}>
					{children}
				</SelectInput>
				<ErrorsList errors={field.errors} translations={field.translation} />
			</Field.Contents>
		</Field>
	);
}

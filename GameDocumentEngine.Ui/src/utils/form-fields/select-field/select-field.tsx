import { ErrorsList } from '@/utils/form/errors/errors-list';
import { Field } from '@/utils/form-fields/field/field';
import { SelectInput } from '@/utils/form-fields/select-input/select-input';
import { UseFieldResult } from '@/utils/form/useField';

export function SelectField<T>({
	field,
	items,
	valueSelector,
	children,
}: {
	field: UseFieldResult<string, { hasErrors: true; hasTranslations: true }>;
	items: T[];
	valueSelector: (item: T) => string;
	children: (item: T) => React.ReactNode;
}) {
	return (
		<Field>
			<Field.Label>{field.translation(['label'])}</Field.Label>
			<Field.Contents>
				<SelectInput
					items={items}
					valueSelector={valueSelector}
					{...field.htmlProps()}
				>
					{children}
				</SelectInput>
				<ErrorsList errors={field.errors} translations={field.translation} />
			</Field.Contents>
		</Field>
	);
}

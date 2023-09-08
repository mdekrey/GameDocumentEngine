import { ErrorsList } from '@/components/form-fields/errors/errors-list';
import { Field } from '@/components/form-fields/field/field';
import { SelectInput } from '@/components/form-fields/select-input/select-input';
import type { UseFieldResult } from '@/utils/form/useField';

export function SelectField<T>({
	field,
	items,
	children,
	readOnly,
}: {
	field: UseFieldResult<T, { hasErrors: true; hasTranslations: true }>;
	items: T[];
	children: (item: T) => React.ReactNode;
	readOnly?: boolean;
}) {
	console.log({ readOnly });
	return (
		<Field noLabel>
			<Field.Label>{field.translation(['label'])}</Field.Label>
			<Field.Contents>
				<SelectInput
					items={items}
					readOnly={readOnly}
					{...field.htmlProps.asControlled()}
				>
					{children}
				</SelectInput>
				<ErrorsList errors={field.errors} translations={field.translation} />
			</Field.Contents>
		</Field>
	);
}

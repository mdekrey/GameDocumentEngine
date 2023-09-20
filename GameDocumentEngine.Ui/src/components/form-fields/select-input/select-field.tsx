import { ErrorsList } from '@/components/form-fields/errors/errors-list';
import { Field } from '@/components/form-fields/field/field';
import {
	SelectInput,
	SelectInputProps,
} from '@/components/form-fields/select-input/select-input';
import type { UseFieldResult } from '@/utils/form/useField';

export function SelectField<T>(props: {
	field: UseFieldResult<T, { hasErrors: true; hasTranslations: true }>;
	items: T[];
	children: (item: T) => React.ReactNode;
	selectInput: React.FC<SelectInputProps<T>>;
}): JSX.Element;
export function SelectField<T>(props: {
	field: UseFieldResult<T, { hasErrors: true; hasTranslations: true }>;
	items: T[];
	children: (item: T) => React.ReactNode;
}): JSX.Element;
export function SelectField<T>({
	field,
	items,
	children,
	selectInput: InputComponent = SelectInput,
}: {
	field: UseFieldResult<T, { hasErrors: true; hasTranslations: true }>;
	items: T[];
	children: (item: T) => React.ReactNode;
	selectInput?: React.FC<SelectInputProps<T>>;
}) {
	return (
		<Field noLabel>
			<Field.Label>{field.translation(['label'])}</Field.Label>
			<Field.Contents>
				<InputComponent items={items} {...field.htmlProps.asControlled()}>
					{children}
				</InputComponent>
				<ErrorsList errors={field.errors} translations={field.translation} />
			</Field.Contents>
		</Field>
	);
}

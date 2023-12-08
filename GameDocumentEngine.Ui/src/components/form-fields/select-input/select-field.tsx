import { ErrorsList } from '@/components/form-fields/errors/errors-list';
import { Field } from '@/components/form-fields/field/field';
import type { SelectInputProps } from '@/components/form-fields/select-input/select-input';
import { SelectInput } from '@/components/form-fields/select-input/select-input';
import type { StandardField } from '../FieldProps';
import { elementTemplate } from '@/components/template';

export const NotSelected = elementTemplate('NotSelected', 'span', (T) => (
	<T className="text-slate-500" />
));

export function SelectField<T>(props: {
	field: StandardField<T>;
	items: readonly T[];
	children: (item: T) => React.ReactNode;
	selectInput: React.FC<SelectInputProps<T>>;
}): JSX.Element;
export function SelectField<T>(props: {
	field: StandardField<T>;
	items: readonly T[];
	children: (item: T) => React.ReactNode;
}): JSX.Element;
export function SelectField<T>({
	field,
	items,
	children,
	selectInput: InputComponent = SelectInput,
}: {
	field: StandardField<T>;
	items: readonly T[];
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

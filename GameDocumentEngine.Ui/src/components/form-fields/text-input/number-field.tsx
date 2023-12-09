import {
	integerMapping,
	undefinedOrIntegerMapping,
	TextField,
	textFieldMappingOptions,
} from './text-field';

const numberField = TextField.extend('NumberField', (T) => <T type="number" />);
export const NumberField = Object.assign(numberField, {
	Integer: numberField.extend('NumberField.Integer', (T) => <T />, {
		...textFieldMappingOptions(integerMapping),
	}),
	UndefinedOrInteger: numberField.extend(
		'NumberField.UndefinedOrInteger',
		(T) => <T />,
		textFieldMappingOptions(undefinedOrIntegerMapping),
	),
});

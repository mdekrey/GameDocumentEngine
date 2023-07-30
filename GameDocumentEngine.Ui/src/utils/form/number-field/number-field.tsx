import {
	applyPropsToTextField,
	applyMappingToTextField,
	integerMapping,
	undefinedOrIntegerMapping,
} from '../text-field/text-field';

export const NumberField = Object.assign(
	applyPropsToTextField('NumberField', { type: 'number' }),
	{
		Integer: applyMappingToTextField('IntegerNumberField', integerMapping, {
			type: 'number',
		}),
		UndefinedOrInteger: applyMappingToTextField(
			'NumberFieldWithUndefined',
			undefinedOrIntegerMapping,
			{ type: 'number' },
		),
	},
);

import type { Meta, StoryObj } from '@storybook/react';

import { NumberField } from './number-field';
import { useField } from '@/utils/form/useField';
import { z } from 'zod';
import { formFieldDecorator } from '../stories/field-decorator';

const meta = {
	title: 'Components/Form/Number Field',
	component: NumberField,
	tags: ['autodocs'],
	argTypes: {
		field: { table: { disable: true } },
		disabled: { control: 'boolean' },
	},
	args: {
		description: false,
		field: undefined,
		disabled: false,
	},
	decorators: [formFieldDecorator],
	render: function RenderNumberFieldStory(props) {
		const myField = useField('', {
			translation: (key) => (typeof key === 'string' ? key : key.join('.')),
			schema: z.string(),
		});
		return <NumberField {...props} field={myField} />;
	},
} satisfies Meta<typeof NumberField>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Primary: Story = {
	args: {},
};

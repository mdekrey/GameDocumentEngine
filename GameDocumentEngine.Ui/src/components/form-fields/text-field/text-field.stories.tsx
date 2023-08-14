import type { Meta, StoryObj } from '@storybook/react';

import { TextField } from './text-field';
import { useField } from '@/utils/form/useField';
import { z } from 'zod';
import { formFieldDecorator } from '../stories/field-decorator';

const meta = {
	title: 'Components/Form/Text Field',
	component: TextField,
	tags: ['autodocs'],
	argTypes: {
		field: { table: { disable: true } },
		mapping: { table: { disable: true } },
		disabled: { control: 'boolean' },
	},
	args: {
		type: 'text',
		description: false,
		field: undefined,
		disabled: false,
	},
	decorators: [formFieldDecorator],
	render: function RenderTextFieldStory(props) {
		const myField = useField('', {
			translation: (key) => (typeof key === 'string' ? key : key.join('.')),
			schema: z.string(),
		});
		return <TextField {...props} field={myField} />;
	},
} satisfies Meta<typeof TextField>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Primary: Story = {
	args: {},
};

import type { Meta, StoryObj } from '@storybook/react';

import { TextareaField } from './textarea-field';
import { useField } from '@/utils/form/useField';
import { z } from 'zod';
import { formFieldDecorator } from '../stories/field-decorator';

const meta = {
	title: 'Components/Form/Textarea Field',
	component: TextareaField,
	tags: ['autodocs'],
	argTypes: {
		field: { table: { disable: true } },
		mapping: { table: { disable: true } },
		disabled: { control: 'boolean' },
	},
	args: {
		description: false,
		field: undefined,
		disabled: false,
	},
	decorators: [formFieldDecorator],
	render: function RenderTextareaFieldStory(props) {
		const myField = useField('', {
			translation: (key) => (typeof key === 'string' ? key : key.join('.')),
			schema: z.string().ip(),
		});
		return <TextareaField {...props} field={myField} />;
	},
} satisfies Meta<typeof TextareaField>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Primary: Story = {
	args: {},
};

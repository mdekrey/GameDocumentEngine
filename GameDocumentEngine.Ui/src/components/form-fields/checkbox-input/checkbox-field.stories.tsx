import type { Meta, StoryObj } from '@storybook/react';

import { CheckboxField } from './checkbox-field';
import { useField } from '@/utils/form/useField';
import { z } from 'zod';

const meta = {
	title: 'Components/Form/Checkbox',
	component: CheckboxField,
	tags: ['autodocs'],
	argTypes: {
		field: { table: { disable: true } },
		readOnly: { control: 'boolean' },
	},
	args: {
		field: undefined,
		readOnly: false,
	},
	render: function RenderCheckboxFieldStory(props) {
		const myField = useField(false, {
			translation: (key) => (typeof key === 'string' ? key : key.join('.')),
			schema: z.boolean().refine((t) => t),
		});
		return <CheckboxField {...props} field={myField} />;
	},
} satisfies Meta<typeof CheckboxField>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Primary: Story = {
	args: {},
};

import type { Meta, StoryObj } from '@storybook/react';

import { ToggleButtonField } from './toggle-button-field';
import { useField } from '@/utils/form/useField';
import { z } from 'zod';

const meta = {
	title: 'Components/Form/Toggle Button',
	component: ToggleButtonField,
	tags: ['autodocs'],
	argTypes: {
		field: { table: { disable: true } },
	},
	args: {
		field: undefined,
	},
	render: function RenderToggleButtonFieldStory(props) {
		const myField = useField(false, {
			translation: (key) => (typeof key === 'string' ? key : key.join('.')),
			schema: z.boolean(),
		});
		return <ToggleButtonField {...props} field={myField} />;
	},
} satisfies Meta<typeof ToggleButtonField>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Primary: Story = {
	args: {},
};

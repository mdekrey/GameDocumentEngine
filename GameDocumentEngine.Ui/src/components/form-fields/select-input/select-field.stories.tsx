import type { Meta, StoryObj } from '@storybook/react';

import { SelectField } from './select-field';
import { useField } from '@/utils/form/useField';
import { z } from 'zod';
import { formFieldDecorator } from '../stories/field-decorator';

const meta = {
	title: 'Components/Form/Select Field',
	component: SelectField,
	tags: ['autodocs'],
	parameters: {
		docs: {
			story: {
				inline: false,
			},
		},
	},
	argTypes: {
		field: { table: { disable: true } },
		items: { table: { disable: true } },
		children: { table: { disable: true } },
	},
	args: {
		field: undefined,
		items: undefined,
		children: undefined,
	},
	decorators: [formFieldDecorator],
	render: function RenderSelectFieldStory(props) {
		const myField = useField('', {
			translation: (key) => (typeof key === 'string' ? key : key.join('.')),
			schema: z.string().ip(),
		});
		return (
			<SelectField {...props} field={myField} items={['one', 'two', 'three']}>
				{(item) => item || <>&nbsp;</>}
			</SelectField>
		);
	},
} satisfies Meta<typeof SelectField>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Primary: Story = {
	args: {},
};

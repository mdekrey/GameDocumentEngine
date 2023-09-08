import type { Meta, StoryObj } from '@storybook/react';

import { SelectField } from './select-field';
import { useField } from '@/utils/form/useField';
import { z } from 'zod';
import { formFieldDecorator } from '../stories/field-decorator';

const meta = {
	title: 'Components/Form/Select Field',
	component: SelectField,
	tags: ['autodocs'],
	argTypes: {
		field: { table: { disable: true } },
		items: { table: { disable: true } },
		children: { table: { disable: true } },
		readOnly: { control: 'boolean' },
	},
	args: {
		field: undefined,
		items: undefined,
		children: undefined,
		readOnly: false,
	},
	decorators: [formFieldDecorator],
	render: function RenderSelectFieldStory(props) {
		console.log(props);
		const myField = useField('', {
			translation: (key) => (typeof key === 'string' ? key : key.join('.')),
			schema: z.string().ip(),
		});
		return (
			<div className="h-64">
				<SelectField {...props} field={myField} items={['one', 'two', 'three']}>
					{(item) => item || <>&nbsp;</>}
				</SelectField>
			</div>
		);
	},
} satisfies Meta<typeof SelectField>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Primary: Story = {
	args: {
		readOnly: false,
	},
};

export const ReadOnly: Story = {
	args: {
		readOnly: true,
	},
};

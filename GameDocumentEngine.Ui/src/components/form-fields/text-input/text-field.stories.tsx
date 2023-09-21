import type { Meta, StoryObj } from '@storybook/react';

import { TextField } from './text-field';
import { useField } from '@/utils/form/useField';
import { z } from 'zod';
import { formFieldDecorator } from '../stories/field-decorator';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';

type Props = React.ComponentProps<typeof TextField> & {
	disabled: boolean;
	readOnly: boolean;
};

const meta = {
	title: 'Components/Form/Text Field',
	component: TextField,
	tags: ['autodocs'],
	argTypes: {
		field: { table: { disable: true } },
		disabled: { control: 'boolean' },
		readOnly: { control: 'boolean' },
	},
	args: {
		type: 'text',
		description: false,
		field: undefined,
		disabled: false,
		readOnly: false,
	},
	decorators: [formFieldDecorator],
	render: function RenderTextFieldStory({
		disabled,
		readOnly,
		...props
	}: Props) {
		const myField = useField('', {
			translation: (key) => (typeof key === 'string' ? key : key.join('.')),
			schema: z.string().ip(),
			disabled: useComputedAtom(() => disabled),
			readOnly: useComputedAtom(() => readOnly),
		});
		return <TextField {...props} field={myField} />;
	},
} satisfies Meta<Props>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Primary: Story = {
	args: {},
};

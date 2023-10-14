import type { Meta, StoryObj } from '@storybook/react';

import { TextField } from './text-field';
import { useField } from '@/utils/form';
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
		const disabledAtom = useComputedAtom(() => disabled);
		const readonlyAtom = useComputedAtom(() => readOnly);
		const myField = useField('', {
			translation: (key) => (typeof key === 'string' ? key : key.join('.')),
			schema: z.string().ip(),
			disabled: (_, get) => get(disabledAtom),
			readOnly: (_, get) => get(readonlyAtom),
		});
		return <TextField {...props} field={myField} />;
	},
} satisfies Meta<Props>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Primary: Story = {
	args: {},
};

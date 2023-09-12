import type { Meta, StoryObj } from '@storybook/react';

import { NumberField } from './number-field';
import { useField } from '@/utils/form/useField';
import { z } from 'zod';
import { formFieldDecorator } from '../stories/field-decorator';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';

type Props = React.ComponentProps<typeof NumberField> & {
	disabled: boolean;
	readOnly: boolean;
};

const meta = {
	title: 'Components/Form/Number Field',
	component: NumberField,
	tags: ['autodocs'],
	argTypes: {
		field: { table: { disable: true } },
		disabled: { control: 'boolean' },
		readOnly: { control: 'boolean' },
	},
	args: {
		description: false,
		field: undefined,
		disabled: false,
		readOnly: false,
	},
	decorators: [formFieldDecorator],
	render: function RenderNumberFieldStory({
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
		return <NumberField {...props} field={myField} />;
	},
} satisfies Meta<Props>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Primary: Story = {
	args: {},
};

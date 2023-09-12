import type { Meta, StoryObj } from '@storybook/react';

import { TextareaField } from './textarea-field';
import { useField } from '@/utils/form/useField';
import { z } from 'zod';
import { formFieldDecorator } from '../stories/field-decorator';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';

type Props = React.ComponentProps<typeof TextareaField> & {
	disabled: boolean;
	readOnly: boolean;
};

const meta = {
	title: 'Components/Form/Textarea Field',
	component: TextareaField,
	tags: ['autodocs'],
	argTypes: {
		field: { table: { disable: true } },
		mapping: { table: { disable: true } },
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
	render: function RenderTextareaFieldStory({ disabled, ...props }: Props) {
		const myField = useField('', {
			translation: (key) => (typeof key === 'string' ? key : key.join('.')),
			schema: z.string().ip(),
			disabled: useComputedAtom(() => disabled),
		});
		return <TextareaField {...props} field={myField} />;
	},
} satisfies Meta<Props>;
type Story = StoryObj<Props>;

export default meta;

export const Primary: Story = {
	args: {},
};

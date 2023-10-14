import type { Meta, StoryObj } from '@storybook/react';

import { SelectField } from './select-field';
import { useField } from '@/utils/form';
import { z } from 'zod';
import { formFieldDecorator } from '../stories/field-decorator';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';

type Props = Omit<React.ComponentProps<typeof SelectField>, 'readOnly'> & {
	disabled: boolean;
	readOnly: boolean;
};

const meta = {
	title: 'Components/Form/Select Field',
	component: SelectField,
	tags: ['autodocs'],
	argTypes: {
		field: { table: { disable: true } },
		items: { table: { disable: true } },
		children: { table: { disable: true } },
		disabled: { control: 'boolean' },
		readOnly: { control: 'boolean' },
	},
	args: {
		field: undefined,
		items: undefined,
		children: undefined,
		disabled: false,
		readOnly: false,
	},
	decorators: [formFieldDecorator],
	render: function RenderSelectFieldStory({ readOnly, disabled, ...props }) {
		const disabledAtom = useComputedAtom(() => disabled);
		const readonlyAtom = useComputedAtom(() => readOnly);
		const myField = useField('', {
			translation: (key) => (typeof key === 'string' ? key : key.join('.')),
			schema: z.string().ip(),
			disabled: (_, get) => get(disabledAtom),
			readOnly: (_, get) => get(readonlyAtom),
		});

		return (
			<div className="h-64">
				<SelectField {...props} field={myField} items={['one', 'two', 'three']}>
					{(item) => item || <>&nbsp;</>}
				</SelectField>
			</div>
		);
	},
} satisfies Meta<Props>;
type Story = StoryObj<Props>;

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

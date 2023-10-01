import type { Meta, StoryObj } from '@storybook/react';

import { ToggleButtonField } from './toggle-button-field';
import { useField } from '@/utils/form/useField';
import { z } from 'zod';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';

type Props = React.ComponentProps<typeof ToggleButtonField> & {
	disabled: boolean;
	readOnly: boolean;
};

const meta = {
	title: 'Components/Form/Toggle Button',
	component: ToggleButtonField,
	tags: ['autodocs'],
	argTypes: {
		field: { table: { disable: true } },
		readOnly: { control: 'boolean' },
		disabled: { control: 'boolean' },
	},
	args: {
		field: undefined,
		readOnly: false,
		disabled: false,
	},
	render: function RenderToggleButtonFieldStory({
		disabled,
		readOnly,
		...props
	}: Props) {
		const disabledAtom = useComputedAtom(() => disabled);
		const readonlyAtom = useComputedAtom(() => readOnly);
		const myField = useField(false, {
			translation: (key) => (typeof key === 'string' ? key : key.join('.')),
			schema: z.boolean(),
			disabled: (_, get) => get(disabledAtom),
			readOnly: (_, get) => get(readonlyAtom),
		});
		return <ToggleButtonField {...props} field={myField} />;
	},
} satisfies Meta<Props>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Primary: Story = {
	args: {},
};

import type { Meta, StoryObj } from '@storybook/react';
import { i18n } from '@/utils/i18n/setup';
import translations from './en.json';

import { FormDemo } from './FormDemo';

i18n.addResourceBundle('en', 'demo', translations.demo);

const meta = {
	title: 'Form Demo',
	component: FormDemo,
	argTypes: { onSubmit: { action: 'onSubmit' } },
} satisfies Meta<typeof FormDemo>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Primary: Story = {
	args: {},
};

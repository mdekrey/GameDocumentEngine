import type { Meta, StoryObj } from '@storybook/react';

import { AvatarButton } from './avatar-button';
import { sampleUser } from '@/utils/stories/sample-data';

const meta = {
	title: 'Components/Avatar/Button',
	component: AvatarButton,
	tags: ['autodocs'],
	argTypes: {
		user: { table: { disable: true } },
	},
	args: {},
} satisfies Meta<typeof AvatarButton>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
	args: {},
};

export const WithUser: Story = {
	args: {
		user: sampleUser,
	},
};

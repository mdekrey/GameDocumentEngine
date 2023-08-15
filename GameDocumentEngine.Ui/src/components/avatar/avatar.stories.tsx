import type { Meta, StoryObj } from '@storybook/react';

import { Avatar } from './avatar';
import { sampleUser } from '@/utils/stories/sample-data';

const meta = {
	title: 'Components/Avatar',
	component: Avatar,
	tags: ['autodocs'],
	argTypes: {
		user: { table: { disable: true } },
	},
	args: {},
} satisfies Meta<typeof Avatar>;
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

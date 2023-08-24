import type { Meta, StoryObj } from '@storybook/react';

import { Tabs } from './tabs';
import { HiCog, HiDocument, HiHome } from 'react-icons/hi2';

const meta = {
	title: 'Components/Tabs',
	component: Tabs,
	tags: ['autodocs'],
	argTypes: {},
	args: {
		tabs: [
			{ key: 1, icon: HiHome, title: 'Home', content: <div>Home Content</div> },
			{
				key: 2,
				icon: HiDocument,
				title: 'Details',
				content: <div>Details Content</div>,
			},
			{
				key: 3,
				icon: HiCog,
				title: 'Settings',
				content: <div>Settings Content</div>,
			},
		],
	},
	render: function RenderTabsStory(props) {
		return <Tabs {...props} />;
	},
} satisfies Meta<typeof Tabs>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Primary: Story = {
	args: {},
};

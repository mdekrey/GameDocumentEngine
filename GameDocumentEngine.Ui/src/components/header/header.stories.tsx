import type { Meta, StoryObj } from '@storybook/react';

import { HubConnectionState } from '@microsoft/signalr';
import { useStorybookHeaderPresentation } from './useStorybookHeaderPresentation';

type HeaderProps = {
	hasUser: boolean;
	connectionState: HubConnectionState;
	onReconnect?: () => void;
};

const meta = {
	title: 'Layout/Header',
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			story: {
				inline: false,
			},
		},
	},
	argTypes: {
		connectionState: {
			control: { type: 'select' },
			options: Object.keys(HubConnectionState),
		},
	},
	args: {
		connectionState: HubConnectionState.Connected,
	},
	render: function RenderNetworkIndicatorStory(props) {
		const Header = useStorybookHeaderPresentation(props);
		return <Header />;
	},
} satisfies Meta<HeaderProps>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
	args: {
		hasUser: true,
	},
};

export const NoUser: Story = {
	args: {
		hasUser: false,
	},
};

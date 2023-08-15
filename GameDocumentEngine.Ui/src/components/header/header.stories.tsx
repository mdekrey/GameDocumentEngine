import type { Meta, StoryObj } from '@storybook/react';

import { Header, MenuTab } from './header';
import { HubConnectionState } from '@microsoft/signalr';
import { useAsAtom } from '@principlestudios/jotai-react-signals';
import { useCallback } from 'react';
import { flyoutHeight } from '@/utils/stories/flyoutHeight';
import { UserDetails } from '@/api/models/UserDetails';
import { sampleUser } from '@/utils/stories/sample-data';

type HeaderProps = {
	mainItem?: MenuTab;
	menuTabs?: MenuTab[];
	user?: UserDetails;
	connectionState: HubConnectionState;
	onReconnect?: () => void;
};

const meta = {
	title: 'Layout/Header',
	tags: ['autodocs'],
	argTypes: {
		connectionState: {
			control: { type: 'select' },
			options: Object.keys(HubConnectionState),
		},
	},
	args: {
		connectionState: HubConnectionState.Connected,
	},
	decorators: [flyoutHeight],
	render: function RenderNetworkIndicatorStory({
		connectionState,
		onReconnect,
		...props
	}) {
		const connectionState$ = useAsAtom(connectionState);
		const reconnect = useCallback(async () => {
			onReconnect?.();
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}, [onReconnect]);
		return (
			<Header
				connectionState={connectionState$}
				onReconnect={reconnect}
				{...props}
			/>
		);
	},
} satisfies Meta<HeaderProps>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
	args: {},
};

export const UserProfile: Story = {
	args: {
		user: sampleUser,
	},
};

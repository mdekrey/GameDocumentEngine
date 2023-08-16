import type { Meta, StoryObj } from '@storybook/react';

import { NetworkIndicator } from './network-indicator';
import { HubConnectionState } from '@microsoft/signalr';
import { useAsAtom } from '@principlestudios/jotai-react-signals';
import { useCallback } from 'react';
import { Modals } from '@/utils/modal/modal-service';

type NetworkIndicatorProps = {
	connectionState: HubConnectionState;
	onReconnect?: () => void;
};

const meta = {
	title: 'Components/NetworkIndicator',
	argTypes: {
		connectionState: {
			control: { type: 'select' },
			options: Object.keys(HubConnectionState),
		},
	},
	args: {
		connectionState: HubConnectionState.Connected,
	},
	render: function RenderNetworkIndicatorStory({
		connectionState,
		onReconnect,
	}) {
		const connectionState$ = useAsAtom(connectionState);
		const reconnect = useCallback(async () => {
			onReconnect?.();
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}, [onReconnect]);
		return (
			<>
				<NetworkIndicator
					connectionState={connectionState$}
					onReconnect={reconnect}
				/>
				<Modals />
			</>
		);
	},
} satisfies Meta<NetworkIndicatorProps>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
	args: {},
};

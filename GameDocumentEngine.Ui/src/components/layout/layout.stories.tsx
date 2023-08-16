import type { Meta, StoryObj } from '@storybook/react';

import { Layout } from './layout';
import { getHeaderMenuItems } from '../header/useHeaderMenuItems';
import { HubConnectionState } from '@microsoft/signalr';
import { useAsAtom } from '@principlestudios/jotai-react-signals';
import { useCallback } from 'react';
import { UserDetails } from '@/api/models/UserDetails';
import { sampleUser } from '@/utils/stories/sample-data';
import { useTranslation } from 'react-i18next';

type HeaderProps = {
	user?: UserDetails;
	connectionState: HubConnectionState;
	onReconnect?: () => void;
};

const meta = {
	title: 'Layout/Layout',
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
	render: function RenderNetworkIndicatorStory({
		connectionState,
		onReconnect,
		...props
	}) {
		const { t } = useTranslation(['layout']);
		const connectionState$ = useAsAtom(connectionState);
		const reconnect = useCallback(async () => {
			onReconnect?.();
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}, [onReconnect]);
		return (
			<Layout
				connectionState={connectionState$}
				onReconnect={reconnect}
				menuItems={getHeaderMenuItems(t, props.user)}
				{...props}
			/>
		);
	},
} satisfies Meta<HeaderProps>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
	args: {
		user: sampleUser,
	},
};

export const NoUser: Story = {
	args: {},
};

import type { Meta, StoryObj } from '@storybook/react';

import { Header } from './header';
import { getHeaderMenuItems } from './useHeaderMenuItems';
import { HubConnectionState } from '@microsoft/signalr';
import { useAsAtom } from '@principlestudios/jotai-react-signals';
import { useCallback } from 'react';
import type { UserDetails } from '@/api/models/UserDetails';
import { sampleUser } from '@/utils/stories/sample-data';
import { useTranslation } from 'react-i18next';

type HeaderProps = {
	user?: UserDetails;
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
			<Header
				connectionState={connectionState$}
				onReconnect={reconnect}
				menuItems={getHeaderMenuItems(t, props.user, () => void 0)}
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

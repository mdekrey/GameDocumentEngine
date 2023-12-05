import type { Meta, StoryObj } from '@storybook/react';

import { Layout } from './layout';
import { getHeaderMenuItems } from '../header/useHeaderMenuItems';
import { HubConnectionState } from '@microsoft/signalr';
import { useAsAtom } from '@principlestudios/jotai-react-signals';
import { useCallback, useMemo } from 'react';
import { randomUser } from '@/utils/stories/sample-data';
import { useTranslation } from 'react-i18next';
import { LoremBlock } from '@/utils/stories/sample-components';

type HeaderProps = {
	hasUser: boolean;
	hasLeftSidebar: boolean;
	hasRightSidebar: boolean;
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
		hasUser: true,
		hasLeftSidebar: true,
		hasRightSidebar: true,
	},
	render: function RenderNetworkIndicatorStory({
		connectionState,
		onReconnect,
		hasUser,
		hasLeftSidebar,
		hasRightSidebar,
		...props
	}) {
		const user = useMemo(() => (hasUser ? randomUser() : undefined), [hasUser]);
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
				menuItems={getHeaderMenuItems(t, user, false, () => void 0)}
				user={user}
				{...props}
			>
				{hasLeftSidebar ? (
					<Layout.LeftSidebar>
						<div className="m-4">
							<LoremBlock />
						</div>
					</Layout.LeftSidebar>
				) : null}
				{hasRightSidebar ? (
					<Layout.RightSidebar>
						<div className="m-4">
							<LoremBlock />
						</div>
					</Layout.RightSidebar>
				) : null}
				<div className="m-4">
					<LoremBlock sentenceCount={8} paragraphCount={10} />
				</div>
			</Layout>
		);
	},
} satisfies Meta<HeaderProps>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
	args: {},
};

export const NoUser: Story = {
	args: {
		hasUser: false,
	},
};

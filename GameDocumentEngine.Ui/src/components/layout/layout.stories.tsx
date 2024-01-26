import type { Meta, StoryObj } from '@storybook/react';

import { LayoutPresentation } from './layout';
import { HubConnectionState } from '@microsoft/signalr';
import { LoremBlock } from '@/utils/stories/sample-components';
import { useStorybookHeaderPresentation } from '../header/useStorybookHeaderPresentation';

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
		const header = useStorybookHeaderPresentation({
			hasUser,
			connectionState,
			onReconnect,
		});
		return (
			<LayoutPresentation
				header={header}
				leftSidebar={
					hasLeftSidebar ? (
						<div className="m-4">
							<LoremBlock />
						</div>
					) : null
				}
				rightSidebar={
					hasRightSidebar ? (
						<div className="m-4">
							<LoremBlock />
						</div>
					) : null
				}
				{...props}
			>
				<div className="m-4">
					<LoremBlock sentenceCount={8} paragraphCount={10} />
				</div>
			</LayoutPresentation>
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

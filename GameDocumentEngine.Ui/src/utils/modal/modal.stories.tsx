import { Button } from '@/components/button/button';
import { ModalAlertLayout } from './alert-layout';
import { Modal } from './modal';
import { Meta, StoryObj } from '@storybook/react';
import { Prose } from '@/components/text/common';

function SampleModal({ children }: React.ComponentProps<typeof Modal>) {
	return (
		<div className="h-64">
			<Modal>{children}</Modal>
		</div>
	);
}

const meta = {
	title: 'Components/Modal',
	component: Modal,
	render: SampleModal,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
	},
	argTypes: {},
	args: {
		children: (
			<ModalAlertLayout>
				<ModalAlertLayout.Title>Deactivate account</ModalAlertLayout.Title>
				<Prose>
					Are you sure you want to deactivate your account? All of your data
					will be permanently removed. This action cannot be undone.
				</Prose>
				<ModalAlertLayout.Buttons>
					<Button.Destructive>Deactivate</Button.Destructive>
					<Button.Secondary>Cancel</Button.Secondary>
				</ModalAlertLayout.Buttons>
			</ModalAlertLayout>
		),
	},
} satisfies Meta<typeof Modal>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Primary: Story = {
	args: {},
};

import { Button } from '@/components/button/button';
import { ModalAlertLayout } from './alert-layout';
import { Modal } from './modal';
import { Meta, StoryObj } from '@storybook/react';

function SampleModal() {
	return (
		<>
			<div className="h-64" />
			<Modal>
				<ModalAlertLayout>
					<ModalAlertLayout.Title>Deactivate account</ModalAlertLayout.Title>
					<p className="text-sm text-gray-500">
						Are you sure you want to deactivate your account? All of your data
						will be permanently removed. This action cannot be undone.
					</p>
					<ModalAlertLayout.Buttons>
						<Button.Destructive>Deactivate</Button.Destructive>
						<Button.Secondary>Cancel</Button.Secondary>
					</ModalAlertLayout.Buttons>
				</ModalAlertLayout>
			</Modal>
		</>
	);
}

const meta = {
	title: 'Components/Modal',
	component: SampleModal,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
	},
} satisfies Meta<typeof SampleModal>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Primary: Story = {};

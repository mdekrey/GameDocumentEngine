import { Button } from '@/components/button/button';
import { ModalAlertLayout } from './alert-layout';
import { Modal } from './modal';
import type { Meta, StoryObj } from '@storybook/react';
import { Prose } from '@/components/text/common';
import { ModalDialogLayout } from './modal-dialog';

function SampleModal({
	children,
	...props
}: React.ComponentProps<typeof Modal>) {
	return (
		<div className="h-64">
			<Modal {...props}>{children}</Modal>
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
	args: {},
} satisfies Meta<typeof Modal>;
type Story = StoryObj<typeof meta>;

export default meta;

export const BasicModal: Story = {
	args: {
		label: 'Details',
		children: (
			<ModalDialogLayout>
				<ModalDialogLayout.Title>Details</ModalDialogLayout.Title>
				<Prose>
					This is the details of the document. Is it full HTML? A form? Hard to
					be sure, but this story will give us an idea.
				</Prose>
				<ModalDialogLayout.Buttons>
					<Button>OK</Button>
					<Button.Secondary>Cancel</Button.Secondary>
				</ModalDialogLayout.Buttons>
			</ModalDialogLayout>
		),
	},
};

export const ModalAlert: Story = {
	args: {
		label: 'Deactivate account',
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
};

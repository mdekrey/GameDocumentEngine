import { Button } from '@/components/button/button';
import { ModalAlertLayout } from './alert-layout';

function FullPageModalContainer({ children }: { children: React.ReactNode }) {
	return (
		<div
			className="relative z-modalBackground"
			aria-labelledby="modal-title"
			role="dialog"
			aria-modal="true"
		>
			{children}
		</div>
	);
}

function ModalBackdrop() {
	/*
	Background backdrop, show/hide based on modal state.

	Entering: "ease-out duration-300"
		From: "opacity-0"
		To: "opacity-100"
	Leaving: "ease-in duration-200"
		From: "opacity-100"
		To: "opacity-0"
	*/
	return (
		<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
	);
}

function ModalPanel({
	children,
	onCancel,
}: {
	children: React.ReactNode;
	onCancel?: () => void;
}) {
	return (
		<div className="fixed inset-0 z-modalForeground overflow-y-auto">
			<div
				className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
				onClick={() => onCancel?.()}
			>
				{/*
				Modal panel, show/hide based on modal state.

				Entering: "ease-out duration-300"
					From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
					To: "opacity-100 translate-y-0 sm:scale-100"
				Leaving: "ease-in duration-200"
					From: "opacity-100 translate-y-0 sm:scale-100"
					To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
			*/}
				<div
					className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
					onClick={(ev) => ev.stopPropagation()}
				>
					{children}
				</div>
			</div>
		</div>
	);
}

export function Modal({
	children,
	onBackdropCancel,
}: {
	children: React.ReactNode;
	onBackdropCancel?: () => void;
}) {
	return (
		<FullPageModalContainer>
			<ModalBackdrop />

			<ModalPanel onCancel={onBackdropCancel}>{children}</ModalPanel>
		</FullPageModalContainer>
	);
}

export function SampleModal() {
	return (
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
	);
}

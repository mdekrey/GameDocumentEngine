import { Button } from '@/components/button/button';
import { HiOutlineExclamation } from 'react-icons/hi';
import withSlots from 'react-slot-component';

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

function ModalPanel({ children }: { children: React.ReactNode }) {
	return (
		<div className="fixed inset-0 z-modalForeground overflow-y-auto">
			<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
				{/*
				Modal panel, show/hide based on modal state.

				Entering: "ease-out duration-300"
					From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
					To: "opacity-100 translate-y-0 sm:scale-100"
				Leaving: "ease-in duration-200"
					From: "opacity-100 translate-y-0 sm:scale-100"
					To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
			*/}
				<div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
					{children}
				</div>
			</div>
		</div>
	);
}

export function ModalAlertIcon() {
	return (
		<div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
			<HiOutlineExclamation className="h-6 w-6 text-red-600" />
		</div>
	);
}

export type ModalAlertLayoutProps = { children?: React.ReactNode };

export type ModalAlertLayoutSlots = {
	Icon: {
		children?: React.ReactNode;
	};
	Buttons: {
		children?: React.ReactNode;
	};
	Title: {
		children?: React.ReactNode;
	};
};

export const ModalAlertLayout = withSlots<
	ModalAlertLayoutSlots,
	ModalAlertLayoutProps
>(function ModalAlertLayout({ children, slotProps }) {
	return (
		<>
			<div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
				<div className="sm:flex sm:items-start">
					{slotProps.Icon?.children}
					<div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
						<h3 className="text-base font-semibold leading-6 text-gray-900">
							{slotProps.Title?.children}
						</h3>
						<div className="mt-2">{children}</div>
					</div>
				</div>
			</div>
			<div className="bg-gray-50 px-4 py-3 flex flex-col sm:flex-row-reverse sm:px-6 gap-3">
				{slotProps.Buttons?.children}
			</div>
		</>
	);
});

export function Modal({ children }: { children: React.ReactNode }) {
	return (
		<FullPageModalContainer>
			<ModalBackdrop />

			<ModalPanel>{children}</ModalPanel>
		</FullPageModalContainer>
	);
}

export function SampleModal() {
	return (
		<Modal>
			<ModalAlertLayout>
				<ModalAlertLayout.Icon>
					<ModalAlertIcon />
				</ModalAlertLayout.Icon>

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

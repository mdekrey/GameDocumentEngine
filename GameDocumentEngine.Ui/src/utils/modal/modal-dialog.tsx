import withSlots from 'react-slot-component';

export type ModalDialogLayoutProps = { children?: React.ReactNode };

export type ModalDialogLayoutSlots = {
	Buttons: {
		children?: React.ReactNode;
	};
	Title: {
		children?: React.ReactNode;
	};
};

export const ModalDialogLayout = withSlots<
	ModalDialogLayoutSlots,
	ModalDialogLayoutProps
>(function ModalDialogLayout({ children, slotProps }) {
	return (
		<>
			<div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
				<div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
					<h3 className="text-base font-semibold leading-6 text-gray-900">
						{slotProps.Title?.children}
					</h3>
					<div className="flex flex-col items-stretch gap-2 mt-2">
						{children}
					</div>
				</div>
			</div>
			<div className="bg-gray-50 px-4 py-3 flex flex-col sm:flex-row-reverse sm:px-6 gap-3">
				{slotProps.Buttons?.children}
			</div>
		</>
	);
});

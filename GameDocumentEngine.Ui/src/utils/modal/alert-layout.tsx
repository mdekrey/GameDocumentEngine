import withSlots from 'react-slot-component';
import { ModalAlertIcon } from './alert-icon';

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
					{slotProps.Icon?.children ?? <ModalAlertIcon />}
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

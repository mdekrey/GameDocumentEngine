import { HiOutlineExclamation } from 'react-icons/hi';

export function ModalAlertIcon() {
	return (
		<div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
			<HiOutlineExclamation className="h-6 w-6 text-red-600" />
		</div>
	);
}

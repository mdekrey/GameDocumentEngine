import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

export function ModalAlertIcon({
	icon: Component = HiOutlineExclamationTriangle,
}: {
	icon?: typeof HiOutlineExclamationTriangle;
}) {
	return (
		<div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
			<Component className="h-6 w-6 text-red-600" />
		</div>
	);
}

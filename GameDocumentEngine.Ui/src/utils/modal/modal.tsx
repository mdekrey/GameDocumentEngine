import { Transition } from '@headlessui/react';
import { useAsAtom } from '@principlestudios/jotai-react-signals';
import type { Atom } from 'jotai';
import { useAtomValue } from 'jotai';
import { Fragment, useState } from 'react';

function FullPageModalContainer({
	children,
	show,
	onReadyToUnmount,
}: {
	children: React.ReactNode;
	show?: Atom<boolean>;
	onReadyToUnmount?: () => void;
}) {
	const [isShowing, setIsShowing] = useState(false);
	const shouldShow = useAtomValue(useAsAtom(show ?? true));
	if (shouldShow != isShowing) setTimeout(() => setIsShowing(shouldShow), 0);

	return (
		<Transition
			appear
			show={isShowing}
			as={Fragment}
			afterLeave={onReadyToUnmount}
		>
			<div
				className="relative z-modalBackground"
				aria-labelledby="modal-title"
				role="dialog"
				aria-modal="true"
			>
				{children}
			</div>
		</Transition>
	);
}

function ModalBackdrop() {
	return (
		<Transition.Child
			as={Fragment}
			enter="ease-out duration-300"
			enterFrom="opacity-0"
			enterTo="opacity-100"
			leave="ease-in duration-200"
			leaveFrom="opacity-100"
			leaveTo="opacity-0"
		>
			<div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" />
		</Transition.Child>
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
				onClick={(ev) => {
					ev.preventDefault();
					ev.stopPropagation();
					if (ev.currentTarget !== ev.target) {
						return;
					}
					onCancel?.();
				}}
			>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
					enterTo="opacity-100 translate-y-0 sm:scale-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100 translate-y-0 sm:scale-100"
					leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
				>
					<div
						className="relative transform overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
						onClick={(ev) => ev.stopPropagation()}
					>
						{children}
					</div>
				</Transition.Child>
			</div>
		</div>
	);
}

export function Modal({
	children,
	show,
	onBackdropCancel,
	onReadyToUnmount,
}: {
	children: React.ReactNode;
	show?: Atom<boolean>;
	onReadyToUnmount?: () => void;
	onBackdropCancel?: () => void;
}) {
	return (
		<FullPageModalContainer show={show} onReadyToUnmount={onReadyToUnmount}>
			<ModalBackdrop />

			<ModalPanel onCancel={onBackdropCancel}>{children}</ModalPanel>
		</FullPageModalContainer>
	);
}

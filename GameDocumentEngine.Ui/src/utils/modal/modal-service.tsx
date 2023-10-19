import type { Atom } from 'jotai';
import { atom, useAtomValue, useStore } from 'jotai';
import { Modal } from './modal';
import { useCallback } from 'react';

/** Fully internal type; do not expose outside of modal system */
type ModalStackEntry = {
	/** JSX binding of ModalOptions.ModalContents including its props for display */
	contents: React.ReactNode;
	/** A unique id to correctly support animations in case a middle modal is removed from the stack */
	id: React.Key;
	/** A boolean atom indicating whether the modal should be displayed. When false, will modal should animate to closed. */
	shouldShow: Atom<boolean>;
	/** Called by the abort signal to cancel the modal */
	onAbortModal(): void;
	/** Called by the backdrop component to reject the promise */
	onBackdropCancel(): void;
	/** Called by the closing animation to actually remove the modal from the stack; this allows the modal system to animate closing the modal */
	onReadyToUnmount(): void;
};

const activeModalStack = atom<ModalStackEntry[]>([]);

/** Special type to not require `additional` to be provided if no props are needed */
export type Additional<TProps> = [TProps] extends [never]
	? { additional?: undefined }
	: {
			additional: TProps;
	  };

export type ModalContentsProps<T, TProps = never> = {
	/** Call this to provide the expected data to the launcher of the modal... and close the modal */
	resolve: (value: T | PromiseLike<T>) => void;
	/** Call this to reject the promise from launching the modal... and close the modal */
	reject: (error: unknown) => void;
	/** Additional properties for the modal; may be an object */
	additional: [TProps] extends [never] ? undefined : TProps;
};

export type ModalOptions<T, TProps = never> = {
	/** The component that represents the modal */
	ModalContents: (args: ModalContentsProps<T, TProps>) => React.ReactNode;
	/** If provided, clicking the backdrop does not abort by default; reject must be called via the args manually */
	onBackdropCancel?: (args: ModalContentsProps<T, TProps>) => void;
	/** An abort signal created via an AbortController that, when signalled, can cancel the modal without having access to the resolve/reject. Results in an `AbortedRejection` error. */
	abort?: AbortSignal;
} & Additional<TProps>;

/** noop is a term dating back to assembly languages - meaning "no operation", or "do nothing". This is used as a placeholder function to be overwritten. */
function noop() {
	// no-op is intentionally blank
}

/** Error sent via the rejected promise if the abort signal is used before the modal completes */
export const AbortRejection: unique symbol = Symbol(
	'Modal cancelled via abort signal',
);
/** Error sent via the rejected promise if the user clicks on the backdrop and no `onBackdropCancel` override was provided */
export const BackdropRejection: unique symbol = Symbol('Modal cancelled');

function rejectViaBackdrop(props: Pick<ModalContentsProps<never>, 'reject'>) {
	props.reject(BackdropRejection);
}

/** Gets a "launchModal" function to work with the atom stack */
export function useLaunchModal() {
	const store = useStore();

	return useCallback(
		function activate<T, TProps = never>({
			ModalContents,
			onBackdropCancel,
			additional,
			abort,
		}: ModalOptions<T, TProps>): Promise<T> {
			if (abort?.aborted) {
				// When the abort signal passed is already signalled, immediately reject
				return Promise.reject(AbortRejection);
			}
			const shouldShow = atom(true);
			const modalStackEntry: ModalStackEntry = {
				contents: null,
				id: Math.random(),
				shouldShow,
				onAbortModal: noop,
				onReadyToUnmount: noop,
				onBackdropCancel: noop,
			};
			const modalFinished = new Promise<void>((resolve) => {
				modalStackEntry.onReadyToUnmount = resolve;
			});
			abort?.addEventListener('abort', abortModal);

			return new Promise<T>((resolve, reject) => {
				// Update modalStackEntry with details only available within promise, such as resolve/reject functions
				const allProps: ModalContentsProps<T, TProps> = {
					resolve,
					reject,
					additional: additional as [TProps] extends [never]
						? undefined
						: TProps,
				};
				modalStackEntry.onAbortModal = () => reject(AbortRejection);
				modalStackEntry.onBackdropCancel = () =>
					(onBackdropCancel ?? rejectViaBackdrop)(allProps);
				modalStackEntry.contents = <ModalContents {...allProps} />;

				// Add new modal to the stack so it displays
				store.set(activeModalStack, (modals) => [...modals, modalStackEntry]);
			}).finally(() => {
				abort?.removeEventListener('abort', abortModal);
				store.set(shouldShow, false);
				modalFinished.finally(() =>
					store.set(activeModalStack, (modals) =>
						modals.filter((m) => m !== modalStackEntry),
					),
				);
			});

			// This function is declared separately so it may be referenced both by `addEventListener` and `removeEventListener`
			function abortModal() {
				modalStackEntry.onAbortModal();
			}
		},
		[store],
	);
}

export function Modals() {
	const modals = useAtomValue(activeModalStack);

	return (
		<>
			{modals.map(
				({ contents, id, shouldShow, onBackdropCancel, onReadyToUnmount }) => (
					<Modal
						key={id}
						onBackdropCancel={onBackdropCancel}
						show={shouldShow}
						onReadyToUnmount={onReadyToUnmount}
					>
						{contents}
					</Modal>
				),
			)}
		</>
	);
}

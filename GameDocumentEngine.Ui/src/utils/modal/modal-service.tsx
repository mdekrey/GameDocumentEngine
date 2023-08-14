import { Atom, atom, useAtomValue, useSetAtom, useStore } from 'jotai';
import { Modal } from './modal';
import { useCallback } from 'react';

type Modal = {
	contents: React.ReactNode;
	id: React.Key;
	shouldShow: Atom<boolean>;
	onBackdropCancel: () => void;
	onReadyToUnmount: () => void;
};

const activeModalStack = atom<Modal[]>([]);

type Additional<TProps> = [TProps] extends [never]
	? { additional?: undefined }
	: {
			additional: TProps;
	  };

export type ModalContentsProps<T, TProps = never> = {
	resolve: (value: T | PromiseLike<T>) => void;
	reject: (error: unknown) => void;
	additional: [TProps] extends [never] ? undefined : TProps;
};

export type ModalOptions<T, TProps = never> = {
	ModalContents: (args: ModalContentsProps<T, TProps>) => React.ReactNode;
	onBackdropCancel?: (args: ModalContentsProps<T, TProps>) => void;
	abort?: AbortSignal;
} & Additional<TProps>;

function noop() {
	// no-op is intentionally blank
}

export const BackdropRejection: unique symbol = Symbol('Modal cancelled');

function rejectViaBackdrop(props: Pick<ModalContentsProps<never>, 'reject'>) {
	props.reject(BackdropRejection);
}

export function useModal() {
	const store = useStore();
	const setModals = useSetAtom(activeModalStack);

	return useCallback(
		async function activate<T, TProps = never>({
			ModalContents,
			onBackdropCancel,
			additional,
			abort,
		}: ModalOptions<T, TProps>) {
			const shouldShow = atom(true);
			const modal: Modal = {
				contents: null,
				id: Math.random(),
				shouldShow,
				onReadyToUnmount: noop,
				onBackdropCancel: noop,
			};
			const modalFinished = new Promise<void>((resolve) => {
				modal.onReadyToUnmount = resolve;
			});
			abort?.addEventListener('abort', unmountModal);

			try {
				return await new Promise<T>((resolve, reject) => {
					const props = { resolve: complete, reject };
					const allProps: ModalContentsProps<T, TProps> = {
						additional: additional as [TProps] extends [never]
							? undefined
							: TProps,
						...props,
					};
					modal.onBackdropCancel = () =>
						(onBackdropCancel ?? rejectViaBackdrop)(allProps);
					modal.contents = <ModalContents {...allProps} />;
					setModals((modals) => [...modals, modal]);

					function complete(value: T | PromiseLike<T>) {
						unmountModal();
						resolve(value);
					}
				});
			} finally {
				unmountModal();
			}

			function unmountModal() {
				abort?.removeEventListener('abort', unmountModal);
				store.set(shouldShow, false);
				modalFinished.finally(() =>
					setModals((modals) => modals.filter((m) => m !== modal)),
				);
			}
		},
		[store, setModals],
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

import { atom, useAtomValue, useSetAtom } from 'jotai';
import { Modal } from './modal';

type Modal = {
	contents: React.ReactNode;
	id: React.Key;
	onBackdropCancel: () => void;
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
} & Additional<TProps>;

function noop() {
	// no-op is intentionally blank
}

export const BackdropRejection: unique symbol = Symbol('Modal cancelled');

function rejectViaBackdrop(props: Pick<ModalContentsProps<never>, 'reject'>) {
	props.reject(BackdropRejection);
}

export function useModal() {
	const setModals = useSetAtom(activeModalStack);

	return async function activate<T, TProps = never>({
		ModalContents,
		onBackdropCancel,
		additional,
	}: ModalOptions<T, TProps>) {
		const modal: Modal = {
			contents: null,
			id: Math.random(),
			onBackdropCancel: noop,
		};
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
			setModals((modals) => modals.filter((m) => m !== modal));
		}
	};
}

export function Modals() {
	const modals = useAtomValue(activeModalStack);

	return (
		<>
			{modals.map(({ contents, id, onBackdropCancel }) => (
				<Modal key={id} onBackdropCancel={onBackdropCancel}>
					{contents}
				</Modal>
			))}
		</>
	);
}

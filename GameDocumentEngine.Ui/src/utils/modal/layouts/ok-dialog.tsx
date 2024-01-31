import { ModalDialogLayout } from '../modal-dialog';
import { Button } from '@/components/button/button';
import type { TFunction } from 'i18next';
import { useLaunchModal, type ModalContentsProps } from '../modal-service';

export type ContentParams = {
	t: TFunction;
	children?: React.ReactNode;
};
export type OkModalLayoutPresentationProps = ContentParams & {
	onOkClicked?: () => void;
};
export function OkModalDialogPresentation({
	t,
	children,
	onOkClicked,
}: OkModalLayoutPresentationProps) {
	return (
		<ModalDialogLayout>
			<ModalDialogLayout.Title>{t('title')}</ModalDialogLayout.Title>
			{children}
			<ModalDialogLayout.Buttons>
				<Button onClick={onOkClicked}>{t('ok')}</Button>
			</ModalDialogLayout.Buttons>
		</ModalDialogLayout>
	);
}

function OkDialogModal({
	resolve,
	additional: useParams,
}: ModalContentsProps<void, () => ContentParams>) {
	const { t, children } = useParams();

	return (
		<OkModalDialogPresentation t={t} onOkClicked={() => resolve()}>
			{children}
		</OkModalDialogPresentation>
	);
}

export function useOkDialog<T extends readonly unknown[]>(
	useParams: (...params: T) => ContentParams,
) {
	const launchModal = useLaunchModal();
	return function launchOkDialog(...params: T) {
		return launchModal({
			ModalContents: OkDialogModal,
			additional: function useContent() {
				return useParams(...params);
			},
		});
	};
}

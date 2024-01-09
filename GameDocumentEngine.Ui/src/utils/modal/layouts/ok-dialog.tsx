import { ModalDialogLayout } from '../modal-dialog';
import { Button } from '@/components/button/button';
import type { TFunction } from 'i18next';
import type { ModalContentsProps, useLaunchModal } from '../modal-service';

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
	additional: { useParams },
}: ModalContentsProps<
	void,
	{
		useParams: () => ContentParams;
	}
>) {
	const { t, children } = useParams();

	return (
		<OkModalDialogPresentation t={t} onOkClicked={() => resolve()}>
			{children}
		</OkModalDialogPresentation>
	);
}

export async function okDialog(
	launchModal: ReturnType<typeof useLaunchModal>,
	useParams: () => ContentParams,
) {
	return await launchModal({
		ModalContents: OkDialogModal,
		additional: { useParams },
	});
}

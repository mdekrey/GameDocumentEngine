import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalDialogLayout } from '../modal-dialog';
import { Button } from '@/components/button/button';

export type OkModalLayoutProps = {
	onOkClicked?: () => void;
	children?: React.ReactNode;
};
export function useOkModalLayout(
	...translationProps: Parameters<typeof useTranslation>
) {
	const { t } = useTranslation(...translationProps);
	return useCallback(
		function OkModalDialogLayout({
			children,
			onOkClicked,
		}: OkModalLayoutProps) {
			return (
				<ModalDialogLayout>
					<ModalDialogLayout.Title>{t('title')}</ModalDialogLayout.Title>
					{children}
					<ModalDialogLayout.Buttons>
						<Button onClick={onOkClicked}>{t('ok')}</Button>
					</ModalDialogLayout.Buttons>
				</ModalDialogLayout>
			);
		},
		[t],
	);
}

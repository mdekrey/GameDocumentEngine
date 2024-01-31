import { Prose } from '@/components/text/common';
import { ModalAlertLayout } from '../alert-layout';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import type { TFunction } from 'i18next';
import { useLaunchModal, type ModalContentsProps } from '../modal-service';
import React from 'react';

export type TranslationParams = {
	t: TFunction;
	// eslint-disable-next-line @typescript-eslint/ban-types
	values?: {};
	components?: Readonly<Record<string, React.ReactElement>>;
};
export type AreYouSureDialogLayoutProps = TranslationParams & {
	onConfirm?: () => void;
	onCancel?: () => void;
};
export function AreYouSureDialogPresentation({
	t,
	values,
	components,
	onConfirm,
	onCancel,
}: AreYouSureDialogLayoutProps) {
	return (
		<ModalAlertLayout>
			<ModalAlertLayout.Title>{t('title')}</ModalAlertLayout.Title>
			<Prose>
				<Trans
					i18nKey="are-you-sure"
					t={t}
					values={values}
					components={components}
				/>
			</Prose>
			<ModalAlertLayout.Buttons>
				<Button.Destructive onClick={onConfirm}>
					{t('submit')}
				</Button.Destructive>
				<Button.Secondary onClick={onCancel}>{t('cancel')}</Button.Secondary>
			</ModalAlertLayout.Buttons>
		</ModalAlertLayout>
	);
}

function AreYouSureModal({
	resolve,
	reject,
	additional: useTranslationParams,
}: ModalContentsProps<boolean, () => TranslationParams>) {
	const { t, values, components } = useTranslationParams();
	return (
		<AreYouSureDialogPresentation
			t={t}
			values={values}
			components={components}
			onCancel={() => reject('Cancel')}
			onConfirm={() => resolve(true)}
		/>
	);
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function useAreYouSure<T extends {}>(
	translationParams: Parameters<typeof useTranslation>,
	Target: React.FC<T>,
) {
	const launchModal = useLaunchModal();
	return (params: T) =>
		launchModal({
			ModalContents: AreYouSureModal,
			additional: function useAreYouSureParams() {
				const { t } = useTranslation(...translationParams);
				return { t, components: { Target: <Target {...params} /> } };
			},
		});
}

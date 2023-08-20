import { Button } from '@/components/button/button';
import { Prose } from '@/components/text/common';
import { ModalAlertLayout } from '@/utils/modal/alert-layout';
import { ModalContentsProps } from '@/utils/modal/modal-service';
import { Trans, useTranslation } from 'react-i18next';

export function RemoveGameUserModal({
	resolve,
	reject,
	additional: { name: originalName },
}: ModalContentsProps<boolean, { name: string }>) {
	const { t } = useTranslation(['remove-game-user']);
	return (
		<ModalAlertLayout>
			<ModalAlertLayout.Title>{t('title')}</ModalAlertLayout.Title>
			<Prose>
				<Trans
					i18nKey="are-you-sure"
					t={t}
					values={{ name: originalName }}
					components={[<span className="font-bold" />]}
				/>
			</Prose>
			<ModalAlertLayout.Buttons>
				<Button.Destructive onClick={() => resolve(true)}>
					{t('submit')}
				</Button.Destructive>
				<Button.Secondary onClick={() => reject('Cancel')}>
					{t('cancel')}
				</Button.Secondary>
			</ModalAlertLayout.Buttons>
		</ModalAlertLayout>
	);
}

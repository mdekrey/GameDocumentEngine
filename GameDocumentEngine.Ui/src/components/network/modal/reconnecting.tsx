import { HiSignal } from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import { ModalContentsProps } from '@/utils/modal/modal-service';
import { ModalAlertLayout } from '@/utils/modal/alert-layout';
import { Button } from '../../button/button';
import { ModalAlertIcon } from '@/utils/modal/alert-icon';

export function ReconnectingModal({ reject }: ModalContentsProps<void>) {
	const { t } = useTranslation(['network'], { keyPrefix: 'reconnecting' });
	return (
		<ModalAlertLayout>
			<ModalAlertLayout.Title>{t('title')}</ModalAlertLayout.Title>
			<ModalAlertLayout.Icon>
				<ModalAlertIcon icon={HiSignal} />
			</ModalAlertLayout.Icon>
			<p className="text-sm text-gray-500">{t('reconnecting-notice')}</p>
			<ModalAlertLayout.Buttons>
				<Button.Secondary onClick={() => reject('Dismissed')}>
					{t('dismiss')}
				</Button.Secondary>
			</ModalAlertLayout.Buttons>
		</ModalAlertLayout>
	);
}

import { HiSignalSlash } from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { ModalAlertLayout } from '@/utils/modal/alert-layout';
import { Button } from '../../button/button';
import { ModalAlertIcon } from '@/utils/modal/alert-icon';
import { Prose } from '@/components/text/common';

export function DisconnectedModal({
	reject,
	additional: { onReconnect },
}: ModalContentsProps<void, { onReconnect: () => void }>) {
	const { t } = useTranslation(['network'], { keyPrefix: 'disconnected' });
	return (
		<ModalAlertLayout>
			<ModalAlertLayout.Title>{t('title')}</ModalAlertLayout.Title>
			<ModalAlertLayout.Icon>
				<ModalAlertIcon icon={HiSignalSlash} />
			</ModalAlertLayout.Icon>
			<Prose>{t('lost-connection-notice')}</Prose>
			<ModalAlertLayout.Buttons>
				<Button.Save onClick={onReconnect}>{t('reconnect')}</Button.Save>
				<Button.Secondary onClick={() => reject('Dismissed')}>
					{t('dismiss')}
				</Button.Secondary>
			</ModalAlertLayout.Buttons>
		</ModalAlertLayout>
	);
}

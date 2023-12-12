import { Button } from '@/components/button/button';
import { Prose } from '@/components/text/common';
import { ModalAlertLayout } from '@/utils/modal/alert-layout';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { Trans, useTranslation } from 'react-i18next';

export function DeleteInviteModal({
	resolve,
	reject,
	additional: { url },
}: ModalContentsProps<boolean, { url: string }>) {
	const { t } = useTranslation(['delete-invite']);
	return (
		<ModalAlertLayout>
			<ModalAlertLayout.Title>{t('title')}</ModalAlertLayout.Title>
			<Prose>
				<Trans
					i18nKey="are-you-sure"
					t={t}
					values={{ url }}
					components={[<span className="font-mono text-blue-950" />]}
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

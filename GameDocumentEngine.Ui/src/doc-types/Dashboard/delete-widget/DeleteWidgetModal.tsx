import { Button } from '@/components/button/button';
import { Prose } from '@/components/text/common';
import { ModalAlertLayout } from '@/utils/modal/alert-layout';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { Trans } from 'react-i18next';
import type { Widget } from '../types';
import { useDocumentName } from '@/components/named-icon/useDocumentName';
import { useDocTypeTranslation, useTranslationFor } from '@/utils/api/hooks';

export function DeleteWidgetModal({
	resolve,
	reject,
	additional: { gameId, widget },
}: ModalContentsProps<
	boolean,
	{
		gameId: string;
		widget: Widget;
	}
>) {
	const DocumentName = useDocumentName(gameId, widget.documentId);
	const t = useDocTypeTranslation('Dashboard', {
		keyPrefix: 'delete-widget-modal',
	});
	const tWidget = useTranslationFor(gameId, widget.documentId, widget.widget);
	return (
		<ModalAlertLayout>
			<ModalAlertLayout.Title>{t('title')}</ModalAlertLayout.Title>
			<Prose>
				<Trans
					i18nKey="are-you-sure"
					t={t}
					values={{ widgetType: tWidget('name') }}
					components={{
						Target: <DocumentName />,
					}}
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

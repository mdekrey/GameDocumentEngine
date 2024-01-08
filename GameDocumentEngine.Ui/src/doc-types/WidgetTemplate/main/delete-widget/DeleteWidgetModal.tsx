import { Button } from '@/components/button/button';
import { Prose } from '@/components/text/common';
import { ModalAlertLayout } from '@/utils/modal/alert-layout';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { Trans } from 'react-i18next';
import type { Widget } from '../../types';
import { useDocTypeTranslation, useTranslationFor } from '@/utils/api/hooks';
import type { DocumentDetails } from '@/api/models/DocumentDetails';

export function DeleteWidgetModal({
	resolve,
	reject,
	additional: { gameId, previewDocument, widget },
}: ModalContentsProps<
	boolean,
	{
		previewDocument: DocumentDetails;
		gameId: string;
		widget: Widget;
	}
>) {
	const t = useDocTypeTranslation('WidgetTemplate', {
		keyPrefix: 'delete-widget-modal',
	});
	const tWidget = useTranslationFor(gameId, previewDocument.id, widget.widget);
	return (
		<ModalAlertLayout>
			<ModalAlertLayout.Title>{t('title')}</ModalAlertLayout.Title>
			<Prose>
				<Trans
					i18nKey="are-you-sure"
					t={t}
					values={{ widgetType: tWidget('name') }}
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

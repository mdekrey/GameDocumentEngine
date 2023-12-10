import { Button } from '@/components/button/button';
import { Prose } from '@/components/text/common';
import { ModalAlertLayout } from '@/utils/modal/alert-layout';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { Trans, useTranslation } from 'react-i18next';
import type { IconType } from 'react-icons';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { Widget } from '../types';
import { NamedIcon } from '@/components/named-icon/NamedIcon';

export function DeleteWidgetModal({
	resolve,
	reject,
	additional: { docTypeKey, widget, icon: Icon, document },
}: ModalContentsProps<
	boolean,
	{
		docTypeKey: string;
		widget: Widget;
		icon: IconType;
		document: DocumentDetails;
	}
>) {
	const { t } = useTranslation('doc-types:Dashboard', {
		keyPrefix: 'delete-widget-modal',
	});
	const { t: tDocument } = useTranslation(`doc-types:${docTypeKey}`);
	const { t: tWidget } = useTranslation(`doc-types:${docTypeKey}`, {
		keyPrefix: `widgets.${widget.widget}`,
	});
	return (
		<ModalAlertLayout>
			<ModalAlertLayout.Title>{t('title')}</ModalAlertLayout.Title>
			<Prose>
				<Trans
					i18nKey="are-you-sure"
					t={t}
					values={{ widgetType: tWidget('name') }}
					components={{
						Target: (
							<NamedIcon
								name={document.name}
								icon={Icon}
								typeName={tDocument('name')}
							/>
						),
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

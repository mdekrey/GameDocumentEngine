import { Button } from '@/components/button/button';
import { Prose } from '@/components/text/common';
import { ModalAlertLayout } from '@/utils/modal/alert-layout';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useTranslation } from 'react-i18next';
import type { IconType } from 'react-icons';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { Widget } from '../types';
import { NamedIcon } from '@/components/named-icon/NamedIcon';

export function InfoWidgetModal({
	resolve,
	additional: { docTypeKey, widget, icon: Icon, document },
}: ModalContentsProps<
	void,
	{
		docTypeKey: string;
		widget: Widget;
		icon: IconType;
		document: DocumentDetails;
	}
>) {
	const { t } = useTranslation('doc-types:Dashboard', {
		keyPrefix: 'info-widget-modal',
	});
	const { t: tDocument } = useTranslation(`doc-types:${docTypeKey}`);
	const { t: tWidget } = useTranslation(`doc-types:${docTypeKey}`, {
		keyPrefix: `widgets.${widget.widget}`,
	});
	return (
		<ModalAlertLayout>
			<ModalAlertLayout.Title>{t('title')}</ModalAlertLayout.Title>
			<Prose>
				{tWidget('name')}
				<NamedIcon
					name={document.name}
					icon={Icon}
					typeName={tDocument('name')}
				/>
			</Prose>
			<ModalAlertLayout.Buttons>
				<Button onClick={() => resolve()}>{t('ok')}</Button>
			</ModalAlertLayout.Buttons>
		</ModalAlertLayout>
	);
}

import { Button } from '@/components/button/button';
import { Prose } from '@/components/text/common';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useTranslation } from 'react-i18next';
import type { IconType } from 'react-icons';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { Widget } from '../types';
import { NamedIcon } from '@/components/named-icon/NamedIcon';
import { ModalDialogLayout } from '@/utils/modal/modal-dialog';

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
		<ModalDialogLayout>
			<ModalDialogLayout.Title>{t('title')}</ModalDialogLayout.Title>
			<Prose>
				{tWidget('name')}{' '}
				<NamedIcon
					name={document.name}
					icon={Icon}
					typeName={tDocument('name')}
				/>
			</Prose>
			<ModalDialogLayout.Buttons>
				<Button onClick={() => resolve()}>{t('ok')}</Button>
			</ModalDialogLayout.Buttons>
		</ModalDialogLayout>
	);
}

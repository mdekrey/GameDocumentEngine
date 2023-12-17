import { Button } from '@/components/button/button';
import { Prose } from '@/components/text/common';
import { ModalAlertLayout } from '@/utils/modal/alert-layout';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { Trans } from 'react-i18next';
import type { IconType } from 'react-icons';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { Widget } from '../types';
import { NamedIcon } from '@/components/named-icon/NamedIcon';
import {
	useDocTypeTranslation,
	useTranslationFor,
	useTranslationForDocument,
} from '@/utils/api/hooks';

export function DeleteWidgetModal({
	resolve,
	reject,
	additional: { widget, icon: Icon, document },
}: ModalContentsProps<
	boolean,
	{
		widget: Widget;
		icon: IconType;
		document: DocumentDetails;
	}
>) {
	const t = useDocTypeTranslation('Dashboard', {
		keyPrefix: 'delete-widget-modal',
	});
	const tDocument = useTranslationForDocument(document);
	const tWidget = useTranslationFor(
		document.gameId,
		widget.documentId,
		widget.widget,
	);
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

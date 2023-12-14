import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import { Prose } from '@/components/text/common';
import { Button } from '@/components/button/button';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import { Trans, useTranslation } from 'react-i18next';
import { NamedIcon } from '@/components/named-icon/NamedIcon';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import type { IconType } from 'react-icons';

export function NoWidgetsModal({
	additional: { docTypeKey, icon: Icon, document },
	reject,
}: ModalContentsProps<
	never,
	{
		docTypeKey: string;
		icon: IconType;
		document: DocumentDetails;
	}
>) {
	const { t: tDocument } = useTranslation(`doc-types:${docTypeKey}`);
	const { t } = useTranslation('doc-types:Dashboard', {
		keyPrefix: 'adding-no-widgets',
	});

	return (
		<ModalDialogLayout>
			<ModalDialogLayout.Title>{t('title')}</ModalDialogLayout.Title>
			<Prose>
				<Trans
					i18nKey="intro"
					t={t}
					values={{ name: document.name }}
					components={{
						Document: (
							<NamedIcon
								name={document.name}
								icon={Icon}
								typeName={tDocument('name')}
							/>
						),
					}}
				/>
			</Prose>
			<ModalDialogLayout.Buttons>
				<Button.Secondary onClick={() => reject('Cancel')}>
					{t('cancel')}
				</Button.Secondary>
			</ModalDialogLayout.Buttons>
		</ModalDialogLayout>
	);
}

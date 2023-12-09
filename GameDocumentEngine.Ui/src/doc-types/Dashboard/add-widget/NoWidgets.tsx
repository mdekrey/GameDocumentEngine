import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import { Prose } from '@/components/text/common';
import { Button } from '@/components/button/button';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { TFunction } from 'i18next';
import type { IconType } from 'react-icons';
import { Trans, useTranslation } from 'react-i18next';

export function NoWidgets({
	dropped,
	tDocument: objT,
	icon: Icon,
	reject,
}: {
	dropped: DocumentDetails;
	tDocument: TFunction;
	icon: IconType;
	reject: (error: unknown) => void;
}) {
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
					values={{ name: dropped.name }}
					components={{
						Icon: <Icon title={objT('name')} className="inline-block" />,
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

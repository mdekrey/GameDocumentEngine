import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import { Prose } from '@/components/text/common';
import { Button } from '@/components/button/button';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { TFunction } from 'i18next';
import type { IconType } from 'react-icons';
import { Trans, useTranslation } from 'react-i18next';
import { NamedIcon } from './NamedIcon';

export function NoWidgets({
	document,
	tDocument: objT,
	icon: Icon,
	reject,
}: {
	document: DocumentDetails;
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
					values={{ name: document.name }}
					components={{
						Document: (
							<NamedIcon
								name={document.name}
								icon={Icon}
								typeName={objT('name')}
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

import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import { Prose } from '@/components/text/common';
import { Button } from '@/components/button/button';
import { Trans } from 'react-i18next';
import { useDocumentName } from '@/components/named-icon/useDocumentName';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useDocTypeTranslation } from '@/utils/api/hooks';

export function NoWidgetsModal({
	additional: { gameId, documentId },
	reject,
}: ModalContentsProps<
	never,
	{
		gameId: string;
		documentId: string;
	}
>) {
	const DocumentName = useDocumentName(gameId, documentId);
	const t = useDocTypeTranslation('WidgetTemplate', {
		keyPrefix: 'adding-no-widgets',
	});

	return (
		<ModalDialogLayout>
			<ModalDialogLayout.Title>{t('title')}</ModalDialogLayout.Title>
			<Prose>
				<Trans
					i18nKey="intro"
					t={t}
					components={{
						Document: <DocumentName />,
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

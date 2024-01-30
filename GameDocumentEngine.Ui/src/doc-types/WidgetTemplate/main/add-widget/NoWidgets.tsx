import { Prose } from '@/components/text/common';
import { Trans } from 'react-i18next';
import { useDocumentName } from '@/components/named-icon/useDocumentName';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useDocTypeTranslation } from '@/utils/api/hooks';
import { OkModalDialogPresentation } from '@/utils/modal/layouts/ok-dialog';

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
		<OkModalDialogPresentation t={t} onOkClicked={() => reject('Cancel')}>
			<Prose>
				<Trans
					i18nKey="intro"
					t={t}
					components={{
						Document: <DocumentName />,
					}}
				/>
			</Prose>
		</OkModalDialogPresentation>
	);
}

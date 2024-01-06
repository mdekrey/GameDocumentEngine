import { Button } from '@/components/button/button';
import { Prose } from '@/components/text/common';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import type { Widget } from '../types';
import { useDocumentName } from '@/components/named-icon/useDocumentName';
import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import type { WidgetBase } from '@/documents/defineDocument';
import { WidgetContainer } from '../grid-utils';
import { useDocTypeTranslation, useTranslationFor } from '@/utils/api/hooks';
import { useWidget } from '../useWidget';

export function InfoWidgetModal<TWidget extends WidgetBase>({
	resolve,
	additional: { gameId, widget },
}: ModalContentsProps<
	void,
	{
		gameId: string;
		widget: Widget<TWidget>;
	}
>) {
	const DocumentName = useDocumentName(gameId, widget.documentId);
	const Widget = useWidget(gameId, widget);
	const t = useDocTypeTranslation('Dashboard', {
		keyPrefix: 'info-widget-modal',
	});
	const tWidget = useTranslationFor(gameId, widget.documentId, widget.widget);
	// TODO: better layout
	return (
		<ModalDialogLayout>
			<ModalDialogLayout.Title>{t('title')}</ModalDialogLayout.Title>
			<div className="flex flex-row-reverse flex-wrap justify-end gap-4">
				<Prose>
					<DocumentName />
					<br />
					{tWidget('name')}
				</Prose>
				<WidgetContainer size={widget.position}>
					<Widget />
				</WidgetContainer>
			</div>
			<ModalDialogLayout.Buttons>
				<Button onClick={() => resolve()}>{t('ok')}</Button>
			</ModalDialogLayout.Buttons>
		</ModalDialogLayout>
	);
}

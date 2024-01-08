import type { ModalContentsProps } from '@/utils/modal/modal-service';
import type { Widget } from '../../types';
import { useDocumentName } from '@/components/named-icon/useDocumentName';
import type { WidgetBase } from '@/documents/defineDocument';
import { useTranslationFor } from '@/utils/api/hooks';
import { useWidget } from '../../useWidget';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import { getDocTypeTranslationNamespace } from '@/utils/api/accessors';
import { useOkModalLayout } from '@/utils/modal/layouts/ok-dialog';
import { InfoWidgetModalPresentation } from '@/doc-types/Dashboard/info/InfoWidgetModalPresentation';

export function InfoWidgetModal<TWidget extends WidgetBase>({
	resolve,
	additional: { gameId, previewDocument, widget },
}: ModalContentsProps<
	void,
	{
		gameId: string;
		previewDocument: DocumentDetails;
		widget: Widget<TWidget>;
	}
>) {
	const DocumentName = useDocumentName(gameId, previewDocument.id);
	const Widget = useWidget(gameId, widget, previewDocument);
	const tWidget = useTranslationFor(gameId, previewDocument.id, widget.widget);
	const OkModalDialogLayout = useOkModalLayout(
		getDocTypeTranslationNamespace('WidgetTemplate'),
		{
			keyPrefix: 'info-widget-modal',
		},
	);

	return (
		<InfoWidgetModalPresentation
			OkModalDialogLayout={OkModalDialogLayout}
			DocumentName={DocumentName}
			widgetName={tWidget('name')}
			widgetSize={widget.position}
			Widget={Widget}
			onOkClicked={() => resolve()}
		/>
	);
}

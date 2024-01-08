import type { ModalContentsProps } from '@/utils/modal/modal-service';
import type { Widget } from '../types';
import { useDocumentName } from '@/components/named-icon/useDocumentName';
import type { WidgetBase } from '@/documents/defineDocument';
import { useTranslationFor } from '@/utils/api/hooks';
import { useWidget } from '../useWidget';
import { useOkModalLayout } from '@/utils/modal/layouts/ok-dialog';
import { getDocTypeTranslationNamespace } from '@/utils/api/accessors';
import { InfoWidgetModalPresentation } from './InfoWidgetModalPresentation';

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
	const tWidget = useTranslationFor(gameId, widget.documentId, widget.widget);
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

import type { Widget } from '../../types';
import type { DocumentDetails } from '@vaultvtt/api/openapi/models/DocumentDetails';
import { useDocumentName } from '@/components/named-icon/useDocumentName';
import { InfoWidgetContentsPresentation } from '@/doc-types/Dashboard/info/InfoWidgetContentsPresentation';
import { useTranslationFor, useDocTypeTranslation } from '@/utils/api/hooks';
import { useOkDialog } from '@/utils/modal/layouts/ok-dialog';
import { useWidget } from '../../useWidget';

export function useShowWidgetInfo(previewDocument: DocumentDetails) {
	return useOkDialog(function useParams(widget: Widget) {
		const DocumentName = useDocumentName(
			previewDocument.gameId,
			previewDocument.id,
		);
		const Widget = useWidget(previewDocument, widget);
		const tWidget = useTranslationFor(
			previewDocument.gameId,
			previewDocument.id,
			widget.widget,
		);

		return {
			t: useDocTypeTranslation('WidgetTemplate', {
				keyPrefix: 'info-widget-modal',
			}),
			children: (
				<InfoWidgetContentsPresentation
					DocumentName={DocumentName}
					widgetName={tWidget('name')}
					widgetSize={widget.position}
					Widget={Widget}
				/>
			),
		};
	});
}

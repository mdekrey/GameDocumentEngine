import type { Widget } from '../../types';
import type { useLaunchModal } from '@/utils/modal/modal-service';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import { useDocumentName } from '@/components/named-icon/useDocumentName';
import { InfoWidgetContentsPresentation } from '@/doc-types/Dashboard/info/InfoWidgetContentsPresentation';
import { useTranslationFor, useDocTypeTranslation } from '@/utils/api/hooks';
import { okDialog } from '@/utils/modal/layouts/ok-dialog';
import { useWidget } from '../../useWidget';

export async function showWidgetInfo(
	launchModal: ReturnType<typeof useLaunchModal>,
	gameId: string,
	previewDocument: DocumentDetails,
	widget: Widget,
) {
	await okDialog(launchModal, () => {
		const DocumentName = useDocumentName(gameId, previewDocument.id);
		const Widget = useWidget(gameId, widget, previewDocument);
		const tWidget = useTranslationFor(
			gameId,
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

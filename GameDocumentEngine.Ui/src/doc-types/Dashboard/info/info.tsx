import type { Widget } from '../types';
import type { ModalLauncher } from '@/utils/modal/modal-service';
import { okDialog } from '@/utils/modal/layouts/ok-dialog';
import { useDocTypeTranslation } from '@/utils/api/hooks';
import { InfoWidgetContentsPresentation } from './InfoWidgetContentsPresentation';
import { useDocumentName } from '@/components/named-icon/useDocumentName';
import { useWidget } from '../useWidget';
import { useTranslationFor } from '@/utils/api/hooks';

export async function showWidgetInfo(
	launchModal: ModalLauncher,
	gameId: string,
	widget: Widget,
) {
	await okDialog(launchModal, () => {
		const DocumentName = useDocumentName(gameId, widget.documentId);
		const Widget = useWidget(gameId, widget);
		const tWidget = useTranslationFor(gameId, widget.documentId, widget.widget);

		return {
			t: useDocTypeTranslation('Dashboard', {
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

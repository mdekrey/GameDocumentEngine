import type { Widget } from '../types';
import { useOkDialog } from '@/utils/modal/layouts/ok-dialog';
import { useDocTypeTranslation } from '@/utils/api/hooks';
import { InfoWidgetContentsPresentation } from './InfoWidgetContentsPresentation';
import { useDocumentName } from '@/components/named-icon/useDocumentName';
import { useWidget } from '../useWidget';
import { useTranslationFor } from '@/utils/api/hooks';

export function useShowWidgetInfo(gameId: string) {
	return useOkDialog(function useParams(widget: Widget) {
		const DocumentName = useDocumentName(gameId, widget.documentId);
		const Widget = useWidget(gameId, widget);
		const tWidget = useTranslationFor(gameId, widget.documentId, widget.widget);

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

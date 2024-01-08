import type { Widget } from '../types';
import { LimitingInset } from '@/doc-types/Dashboard/Inset';
import { useWidget } from '../useWidget';
import type { DocumentDetails } from '@/api/models/DocumentDetails';

export function RenderWidget({
	gameId,
	widgetConfig,
	previewDocument,
}: {
	gameId: string;
	widgetConfig: Widget;
	previewDocument: DocumentDetails;
}) {
	const Widget = useWidget(gameId, widgetConfig, previewDocument);
	return (
		<LimitingInset>
			<Widget />
		</LimitingInset>
	);
}

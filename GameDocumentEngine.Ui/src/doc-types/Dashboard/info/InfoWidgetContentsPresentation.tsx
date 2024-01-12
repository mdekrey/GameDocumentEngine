import { Prose } from '@/components/text/common';
import type { Size } from '@/documents/defineDocument';
import { WidgetContainer } from '../grid-utils';

export function InfoWidgetContentsPresentation({
	DocumentName,
	widgetName,
	widgetSize,
	Widget,
}: {
	DocumentName: React.FC;
	widgetName: string;
	widgetSize: Size;
	Widget: React.FC;
}) {
	// TODO: better layout
	return (
		<div className="flex flex-row-reverse flex-wrap justify-end gap-4">
			<Prose>
				<DocumentName />
				<br />
				{widgetName}
			</Prose>
			<WidgetContainer size={widgetSize}>
				<Widget />
			</WidgetContainer>
		</div>
	);
}

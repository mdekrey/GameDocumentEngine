import { Prose } from '@/components/text/common';
import type { Size } from '@/documents/defineDocument';
import { WidgetContainer } from '../grid-utils';
import type { OkModalLayoutProps } from '@/utils/modal/layouts/ok-dialog';

export function InfoWidgetModalPresentation({
	OkModalDialogLayout,
	DocumentName,
	widgetName,
	widgetSize,
	Widget,
	onOkClicked,
}: {
	OkModalDialogLayout: React.FC<OkModalLayoutProps>;
	DocumentName: React.FC;
	widgetName: string;
	widgetSize: Size;
	Widget: React.FC;
	onOkClicked?: () => void;
}) {
	// TODO: better layout
	return (
		<OkModalDialogLayout onOkClicked={onOkClicked}>
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
		</OkModalDialogLayout>
	);
}

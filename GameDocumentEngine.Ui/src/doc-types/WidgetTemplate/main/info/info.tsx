import type { Widget } from '../../types';
import type { useLaunchModal } from '@/utils/modal/modal-service';
import { InfoWidgetModal } from './InfoWidgetModal';
import type { DocumentDetails } from '@/api/models/DocumentDetails';

export async function showWidgetInfo(
	launchModal: ReturnType<typeof useLaunchModal>,
	gameId: string,
	previewDocument: DocumentDetails,
	widget: Widget,
) {
	await launchModal({
		ModalContents: InfoWidgetModal,
		additional: {
			gameId,
			previewDocument,
			widget,
		},
	});
}

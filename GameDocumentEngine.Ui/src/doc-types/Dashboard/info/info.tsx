import type { Widget } from '../types';
import type { useLaunchModal } from '@/utils/modal/modal-service';
import { InfoWidgetModal } from './InfoWidgetModal';

export async function showWidgetInfo(
	launchModal: ReturnType<typeof useLaunchModal>,
	gameId: string,
	widget: Widget,
) {
	await launchModal({
		ModalContents: InfoWidgetModal,
		additional: {
			gameId,
			widget,
		},
	});
}

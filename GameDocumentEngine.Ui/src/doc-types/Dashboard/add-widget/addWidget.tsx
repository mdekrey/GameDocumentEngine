import type { Widget } from '../types';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import type { useLaunchModal } from '@/utils/modal/modal-service';
import { AddWidgetModal } from './AddWidgetModal';

export async function addWidget(
	launchModal: ReturnType<typeof useLaunchModal>,
	document: { gameId: string; id: string },
	widgets: FormFieldReturnType<Record<string, Widget>>,
	coordinate: { x: number; y: number },
) {
	try {
		const result = await launchModal({
			ModalContents: AddWidgetModal,
			additional: document,
		});
		widgets.onChange((prev) => ({
			...prev,
			[crypto.randomUUID()]: {
				documentId: document.id,
				position: {
					...coordinate,
					width: result.defaults.width,
					height: result.defaults.height,
				},
				widget: result.id,
			},
		}));
	} catch (ex) {
		// On a cancel, do nothing
	}
}

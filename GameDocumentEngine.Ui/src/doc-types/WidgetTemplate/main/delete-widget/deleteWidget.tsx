import type { Widget } from '../../types';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import type { useLaunchModal } from '@/utils/modal/modal-service';
import { produce } from 'immer';
import { DeleteWidgetModal } from './DeleteWidgetModal';
import type { DocumentDetails } from '@/api/models/DocumentDetails';

export async function deleteWidget(
	launchModal: ReturnType<typeof useLaunchModal>,
	gameId: string,
	previewDocument: DocumentDetails,
	widgetsField: FormFieldReturnType<Record<string, Widget>>,
	key: string,
) {
	const widget = widgetsField.getValue()[key];

	try {
		if (
			await launchModal({
				ModalContents: DeleteWidgetModal,
				additional: {
					gameId,
					previewDocument,
					widget,
				},
			})
		)
			applyChange();
	} catch (ex) {
		// On a cancel, do nothing
	}

	function applyChange() {
		widgetsField.onChange((prev) =>
			produce(prev, (widgets) => {
				delete widgets[key];
			}),
		);
	}
}

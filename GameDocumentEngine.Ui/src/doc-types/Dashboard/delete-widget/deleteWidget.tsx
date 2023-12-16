import type { Widget } from '../types';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import type { useLaunchModal } from '@/utils/modal/modal-service';
import type { QueryClient } from '@tanstack/react-query';
import { fetchDocument, fetchDocumentType } from '@/utils/api/loaders';
import { produce } from 'immer';
import { DeleteWidgetModal } from './DeleteWidgetModal';

export async function deleteWidget(
	queryClient: QueryClient,
	launchModal: ReturnType<typeof useLaunchModal>,
	gameId: string,
	widgetsField: FormFieldReturnType<Record<string, Widget>>,
	key: string,
) {
	const targetWidget = widgetsField.getValue()[key];
	const docId = targetWidget.documentId;
	const document = await fetchDocument(queryClient, gameId, docId);
	const docType = await fetchDocumentType(queryClient, gameId, docId);
	const additional = {
		docTypeKey: docType.key,
		icon: docType.typeInfo.icon,
		document,
		widget: targetWidget,
	};

	try {
		if (
			await launchModal({
				ModalContents: DeleteWidgetModal,
				additional,
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

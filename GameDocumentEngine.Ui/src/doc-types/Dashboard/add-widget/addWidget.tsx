import type { Widget } from '../types';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import type { useLaunchModal } from '@/utils/modal/modal-service';
import type { NewWidgetResult } from './AddWidgetModal';
import { AddWidgetModal } from './AddWidgetModal';
import type { QueryClient } from '@tanstack/react-query';
import { fetchDocument, fetchDocumentType } from '@/utils/api/loaders';
import { NoWidgetsModal } from './NoWidgets';

export async function addWidget(
	queryClient: QueryClient,
	launchModal: ReturnType<typeof useLaunchModal>,
	{ gameId, id }: { gameId: string; id: string },
	widgetsField: FormFieldReturnType<Record<string, Widget>>,
	coordinate: { x: number; y: number },
) {
	const document = await fetchDocument(queryClient, gameId, id);
	const docType = await fetchDocumentType(queryClient, gameId, id);
	const widgets = docType?.typeInfo.widgets ?? {};
	const additional = {
		gameId,
		documentId: id,
		widgets,
	};
	const widgetKeys = Object.keys(additional.widgets);

	if (widgetKeys.length === 0)
		return await launchModal({ ModalContents: NoWidgetsModal, additional });
	if (widgetKeys.length === 1) return applyChange({ id: widgetKeys[0] });

	try {
		const result = await launchModal({
			ModalContents: AddWidgetModal,
			additional: {
				gameId,
				documentId: id,
				widgets,
			},
		});
		applyChange(result);
	} catch (ex) {
		// On a cancel, do nothing
	}

	function applyChange(result: NewWidgetResult) {
		widgetsField.onChange((prev) => ({
			...prev,
			[crypto.randomUUID()]: {
				documentId: document.id,
				position: {
					...coordinate,
					width: additional.widgets[result.id].defaults.width,
					height: additional.widgets[result.id].defaults.height,
				},
				widget: result.id,
				settings: additional.widgets[result.id].settings?.default ?? {},
			},
		}));
	}
}

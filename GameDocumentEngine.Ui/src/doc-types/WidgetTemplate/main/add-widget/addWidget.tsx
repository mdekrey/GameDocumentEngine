import type { Widget } from '../../types';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import type { ModalLauncher } from '@/utils/modal/modal-service';
import type { NewWidgetResult } from './AddWidgetModal';
import { AddWidgetModal } from './AddWidgetModal';
import type { QueryClient } from '@tanstack/react-query';
import { fetchDocumentType } from '@/utils/api/loaders';
import { NoWidgetsModal } from './NoWidgets';
import type { DocumentDetails } from '@/api/models/DocumentDetails';

export async function addWidget(
	queryClient: QueryClient,
	launchModal: ModalLauncher,
	document: DocumentDetails,
	widgetsField: FormFieldReturnType<Record<string, Widget>>,
	coordinate: { x: number; y: number },
) {
	const docType = await fetchDocumentType(
		queryClient,
		document.gameId,
		document.id,
	);
	const widgets = docType?.typeInfo.widgets ?? {};
	const additional = {
		gameId: document.gameId,
		documentId: document.id,
		widgets,
	};
	const widgetKeys = Object.keys(additional.widgets);

	if (widgetKeys.length === 0)
		return await launchModal({ ModalContents: NoWidgetsModal, additional });
	if (widgetKeys.length === 1) return applyChange({ id: widgetKeys[0] });

	try {
		const result = await launchModal({
			ModalContents: AddWidgetModal,
			additional,
		});
		applyChange(result);
	} catch (ex) {
		// On a cancel, do nothing
	}

	function applyChange(result: NewWidgetResult) {
		widgetsField.onChange((prev) => ({
			...prev,
			[crypto.randomUUID()]: {
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

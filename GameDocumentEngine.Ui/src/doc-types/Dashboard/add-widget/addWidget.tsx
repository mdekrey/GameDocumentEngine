import type { Widget } from '../types';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import type { ModalLauncher } from '@/utils/modal/modal-service';
import type { NewWidgetResult } from './NewWidgetResult';
import { AddWidgetModal } from './AddWidgetModal';
import type { QueryClient } from '@tanstack/react-query';
import { fetchDocument, fetchDocumentType } from '@/utils/api/loaders';
import { NoWidgetsModal } from './NoWidgets';

export async function addWidget(
	queryClient: QueryClient,
	launchModal: ModalLauncher,
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
	if (widgetKeys.length === 1) {
		const { settings, defaults } = additional.widgets[widgetKeys[0]];
		if (
			!settings ||
			(await settings.schema.safeParseAsync(settings.default)).success
		)
			return applyChange({ id: widgetKeys[0], size: defaults });
	}

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
					width: result.size.width,
					height: result.size.height,
				},
				widget: result.id,
				settings:
					result.settings ??
					additional.widgets[result.id].settings?.default ??
					{},
			},
		}));
	}
}

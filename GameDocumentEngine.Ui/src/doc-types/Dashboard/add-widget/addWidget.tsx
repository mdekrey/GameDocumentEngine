import type { Widget } from '../types';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import type { useLaunchModal } from '@/utils/modal/modal-service';
import type { NewWidgetResult } from './AddWidgetModal';
import { AddWidgetModal } from './AddWidgetModal';
import type { QueryClient } from '@tanstack/react-query';
import { getGameType } from '@/apps/documents/useGameType';
import { queries } from '@/utils/api/queries';
import { NoWidgetsModal } from './NoWidgets';

export async function addWidget(
	queryClient: QueryClient,
	launchModal: ReturnType<typeof useLaunchModal>,
	documentIds: { gameId: string; id: string },
	widgetsField: FormFieldReturnType<Record<string, Widget>>,
	coordinate: { x: number; y: number },
) {
	const gameType = await getGameType(queryClient, documentIds.gameId);
	const document = await queryClient.fetchQuery(
		queries.getDocument(documentIds.gameId, documentIds.id),
	);

	const docType = gameType.objectTypes[document.type];
	if (!docType) return;
	const { widgets = {}, icon } = docType.typeInfo;
	const additional = {
		docTypeKey: docType.key,
		widgets,
		icon,
		document,
	};
	const widgetKeys = Object.keys(widgets);

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
				documentId: document.id,
				position: {
					...coordinate,
					width: widgets[result.id].defaults.width,
					height: widgets[result.id].defaults.height,
				},
				widget: result.id,
				settings: widgets[result.id].defaultSettings,
			},
		}));
	}
}

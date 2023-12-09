import type { Widget } from '../types';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import type { useLaunchModal } from '@/utils/modal/modal-service';
import { AddWidgetModal } from './AddWidgetModal';
import type { QueryClient } from '@tanstack/react-query';
import { getGameType } from '@/apps/documents/useGameType';
import { queries } from '@/utils/api/queries';

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
	const { widgets, icon } = docType.typeInfo;

	try {
		const result = await launchModal({
			ModalContents: AddWidgetModal,
			additional: {
				docTypeKey: docType.key,
				widgets,
				icon,
				document,
			},
		});
		widgetsField.onChange((prev) => ({
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

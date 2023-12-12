import type { Widget } from '../types';
import type { useLaunchModal } from '@/utils/modal/modal-service';
import type { QueryClient } from '@tanstack/react-query';
import { getGameType } from '@/apps/documents/useGameType';
import { queries } from '@/utils/api/queries';
import { InfoWidgetModal } from './InfoWidgetModal';

export async function showWidgetInfo(
	queryClient: QueryClient,
	launchModal: ReturnType<typeof useLaunchModal>,
	gameId: string,
	widget: Widget,
) {
	const gameType = await getGameType(queryClient, gameId);
	const document = await queryClient.fetchQuery(
		queries.getDocument(gameId, widget.documentId),
	);

	const docType = gameType.objectTypes[document.type];
	if (!docType) return;
	const { icon } = docType.typeInfo;
	const additional = {
		docTypeKey: docType.key,
		icon,
		document,
		widget,
	};

	await launchModal({
		ModalContents: InfoWidgetModal,
		additional,
	});
}

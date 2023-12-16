import type { Widget } from '../types';
import type { useLaunchModal } from '@/utils/modal/modal-service';
import type { QueryClient } from '@tanstack/react-query';
import {
	fetchDocument,
	fetchDocumentType,
	fetchGameType,
	fetchWidgetType,
} from '@/utils/api/loaders';
import { InfoWidgetModal } from './InfoWidgetModal';
import type { UserDetails } from '@/api/models/UserDetails';

export async function showWidgetInfo(
	queryClient: QueryClient,
	launchModal: ReturnType<typeof useLaunchModal>,
	gameId: string,
	widget: Widget,
	user: UserDetails,
) {
	const docId = widget.documentId;
	const gameType = await fetchGameType(queryClient, gameId);
	const document = await fetchDocument(queryClient, gameId, docId);
	const docType = await fetchDocumentType(queryClient, gameId, docId);
	const widgetDefinition = await fetchWidgetType(
		queryClient,
		gameId,
		docId,
		widget.widget,
	);

	await launchModal({
		ModalContents: InfoWidgetModal,
		additional: {
			user,
			gameType,
			docType,
			widgetDefinition,
			document,
			widget,
			icon: docType.typeInfo.icon,
		},
	});
}

import { extraQueries } from '@/utils/api/queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentIdMimeType, useDropTarget } from '@/components/drag-drop';

export function useFolderDragTarget(
	gameId: string,
	folderPath?: (string | null)[],
	folderId?: string,
) {
	const reordering = useMutation(
		extraQueries.changeDocumentFolder(useQueryClient(), gameId),
	);
	return useDropTarget({
		[documentIdMimeType]: {
			canHandle: ({ move }) => (move ? 'move' : false),
			handle: (ev, current) => {
				if (current.gameId !== gameId) return false;
				if (folderPath && folderPath.includes(current.id)) return false;

				reordering.mutate({ id: current.id, folderId });
				return true;
			},
		},
	});
}

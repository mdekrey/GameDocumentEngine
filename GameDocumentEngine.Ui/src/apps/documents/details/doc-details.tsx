import { queries } from '@/utils/api/queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useGameType } from '../useGameType';
import { Draft, produceWithPatches } from 'immer';
import type { EditableDocumentDetails } from '@/documents/defineDocument';
import { immerPatchToStandard } from '@/utils/api/immerPatchToStandard';
import { useModal } from '@/utils/modal/modal-service';
import { useNavigate } from 'react-router-dom';
import { DeleteDocumentModal } from './delete-document-modal';

export function DocumentDetails({
	gameId,
	documentId,
}: {
	gameId: string;
	documentId: string;
}) {
	const navigate = useNavigate();
	const launchModal = useModal();

	const queryClient = useQueryClient();
	const deleteDocument = useMutation(
		queries.deleteDocument(queryClient, gameId, documentId),
	);
	const updateDocument = useMutation(
		queries.patchDocument(queryClient, gameId, documentId),
	);
	const document = useQuery(queries.getDocument(gameId, documentId));
	const gameType = useGameType(gameId);

	if (document.isLoading || gameType.isLoading) {
		return <>Loading...</>;
	} else if (document.isError || gameType.isError) {
		return <>Error while loading...</>;
	}

	const docData = document.data;

	const {
		typeInfo: { component: Component },
		translation,
	} = gameType.data.objectTypes[document.data.type];

	// TODO: This is making it impossible to reduce rerenders; need to `useCallback`.
	// Also, `useMutation` has in-progress states; use them for something, or find a way
	// to further reduce re-renders here, too.
	return (
		<Component
			gameId={gameId}
			documentId={documentId}
			document={document}
			onDeleteDocument={() => void handleDelete()}
			onUpdateDocument={handleUpdate}
			translation={translation}
		/>
	);

	async function handleDelete() {
		const shouldDelete = await launchModal({
			ModalContents: DeleteDocumentModal,
			additional: { name: docData.name },
		}).catch(() => false);
		if (shouldDelete) {
			deleteDocument.mutate();
			navigate(`/game/${gameId}`);
		}
	}

	function handleUpdate(
		recipe: (draft: Draft<EditableDocumentDetails>) => void,
	) {
		const patches = produceWithPatches<
			EditableDocumentDetails,
			Draft<EditableDocumentDetails>
		>(docData, (draft) => void recipe(draft))[1];

		updateDocument.mutate(patches.map(immerPatchToStandard));
	}
}

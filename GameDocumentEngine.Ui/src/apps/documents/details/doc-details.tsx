import { queries } from '@/utils/api/queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useGameType } from '../useGameType';
import { Draft, produceWithPatches } from 'immer';
import type { EditableDocumentDetails } from '@/documents/defineDocument';
import { immerPatchToStandard } from '@/utils/api/immerPatchToStandard';

export function DocumentDetails({
	gameId,
	documentId,
}: {
	gameId: string;
	documentId: string;
}) {
	const queryClient = useQueryClient();
	const deleteDocument = useMutation(
		queries.deleteDocument(queryClient, gameId, documentId),
	);
	const updateDocument = useMutation(
		queries.patchDocument(queryClient, gameId, documentId),
	);
	const document = useQuery(queries.getDocument(gameId, documentId));
	const gameType = useGameType(gameId);

	// TODO: display component of game type with loaded document
	if (document.isLoading || gameType.isLoading) {
		return <>Loading...</>;
	} else if (document.isError || gameType.isError) {
		return <>Error while loading...</>;
	}

	const docData = document.data;

	const { component: Component } =
		gameType.data.objectTypes[document.data.type].typeInfo;

	return (
		<Component
			gameId={gameId}
			documentId={documentId}
			document={document}
			onDeleteDocument={handleDelete}
			onUpdateDocument={handleUpdate}
		/>
	);

	function handleDelete() {
		console.log('onDelete', docData);
		// TODO: confirmation
		deleteDocument.mutate();
	}

	function handleUpdate(
		recipe: (draft: Draft<EditableDocumentDetails>) => void,
	) {
		const patches = produceWithPatches<
			EditableDocumentDetails,
			Draft<EditableDocumentDetails>
		>(docData, (draft) => void recipe(draft))[1];

		updateDocument.mutate(patches.map(immerPatchToStandard));

		console.log({ patches });
	}
}

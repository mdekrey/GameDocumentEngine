import { queries } from '@/utils/api/queries';
import { NarrowContent } from '@/utils/containers/narrow-content';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RoleAssignment } from '@/components/forms/role-assignment/role-assignment';
import { useTranslation } from 'react-i18next';

function useUpdateDocumentRoleAssignments(gameId: string, documentId: string) {
	return useMutation(queries.updateDocumentRoleAssignments(gameId, documentId));
}

export function DocumentRoles({
	gameId,
	documentId,
}: {
	gameId: string;
	documentId: string;
}) {
	const { t } = useTranslation('document-roles');
	const gameResult = useQuery(queries.getGameDetails(gameId));
	const documentResult = useQuery(queries.getDocument(gameId, documentId));
	const updateDocumentRoleAssignments = useUpdateDocumentRoleAssignments(
		gameId,
		documentId,
	);

	if (gameResult.isLoading || documentResult.isLoading) {
		return 'Loading';
	}
	if (!gameResult.isSuccess || !documentResult.isSuccess) {
		return 'An error occurred loading the game.';
	}

	const gameDetails = gameResult.data;
	const docType = gameDetails.typeInfo.objectTypes.find(
		(t) => t.name == documentResult.data.type,
	);
	if (!docType) {
		return 'Unknown document type';
	}
	const actualRoles = ['', ...docType.userRoles];
	const permissions = documentResult.data.permissions;

	return (
		<NarrowContent>
			<RoleAssignment
				permissions={permissions}
				playerNames={gameDetails.playerNames}
				defaultRole=""
				roles={actualRoles}
				onSaveRoles={onSaveRoles}
				translations={t}
			/>
		</NarrowContent>
	);
	function onSaveRoles(roleAssignments: { [userId: string]: string }) {
		const changed = Object.fromEntries(
			Object.entries(roleAssignments)
				.map(
					([key, newValue]) =>
						[key, newValue === '' ? null : newValue] as const,
				)
				.filter(([key, newValue]) => newValue !== (permissions[key] ?? null)),
		);
		updateDocumentRoleAssignments.mutate(changed);
	}
}

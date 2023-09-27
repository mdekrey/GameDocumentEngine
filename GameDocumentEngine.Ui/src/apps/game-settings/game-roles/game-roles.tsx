import { queries } from '@/utils/api/queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RoleAssignment } from '@/components/forms/role-assignment/role-assignment';
import { useTranslation } from 'react-i18next';
import { useGameType } from '@/apps/documents/useGameType';
import { hasGamePermission } from '@/utils/security/match-permission';
import { updateGameUserAccess } from '@/utils/security/permission-strings';

function useUpdateGameRoleAssignments(gameId: string) {
	return useMutation(queries.updateGameRoleAssignments(gameId));
}

export function GameRoles({ gameId }: { gameId: string }) {
	const { t } = useTranslation('game-roles');
	const gameResult = useQuery(queries.getGameDetails(gameId));
	const updateGameRoleAssignments = useUpdateGameRoleAssignments(gameId);
	const gameType = useGameType(gameId);

	if (gameResult.isLoading || gameType.isLoading) {
		return 'Loading';
	}
	if (!gameResult.isSuccess || !gameType.isSuccess) {
		return 'An error occurred loading the game.';
	}

	const gameDetails = gameResult.data;

	return (
		<RoleAssignment
			userRoles={gameDetails.userRoles}
			playerNames={gameDetails.playerNames}
			roles={gameDetails.typeInfo.userRoles}
			onSaveRoles={onSaveRoles}
			roleTranslationsNamespace={gameType.data.translationNamespace}
			translations={t}
			allowUpdate={hasGamePermission(gameDetails, updateGameUserAccess)}
		/>
	);
	function onSaveRoles(roleAssignments: { [userId: string]: string }) {
		const changed = Object.fromEntries(
			Object.entries(roleAssignments).filter(
				([key, newValue]) => newValue !== gameDetails.userRoles[key],
			),
		);
		updateGameRoleAssignments.mutate(changed);
	}
}

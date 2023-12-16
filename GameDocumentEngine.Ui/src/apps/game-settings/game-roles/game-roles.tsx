import { queries } from '@/utils/api/queries';
import { useMutation } from '@tanstack/react-query';
import { RoleAssignment } from '@/components/forms/role-assignment/role-assignment';
import { useTranslation } from 'react-i18next';
import { useGame, useGameType } from '@/utils/api/hooks';
import { hasGamePermission } from '@/utils/security/match-permission';
import { updateGameUserAccess } from '@/utils/security/permission-strings';

function useUpdateGameRoleAssignments(gameId: string) {
	return useMutation(queries.updateGameRoleAssignments(gameId));
}

export function GameRoles({ gameId }: { gameId: string }) {
	const { t } = useTranslation('game-roles');
	const gameDetails = useGame(gameId);
	const updateGameRoleAssignments = useUpdateGameRoleAssignments(gameId);
	const gameType = useGameType(gameId);

	return (
		<RoleAssignment
			userRoles={gameDetails.userRoles}
			playerNames={gameDetails.playerNames}
			roles={gameDetails.typeInfo.userRoles}
			onSaveRoles={onSaveRoles}
			roleTranslationsNamespace={gameType.translationNamespace}
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

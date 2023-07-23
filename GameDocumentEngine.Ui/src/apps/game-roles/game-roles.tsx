import { queries } from '@/utils/api/queries';
import { NarrowContent } from '@/utils/containers/narrow-content';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RoleAssignment } from '@/components/forms/role-assignment/role-assignment';

function useUpdateGameRoleAssignments(gameId: string) {
	return useMutation(queries.updateGameRoleAssignments(gameId));
}

export function GameRoles({ gameId }: { gameId: string }) {
	const gameResult = useQuery(queries.getGameDetails(gameId));
	const gameRolesResult = useQuery(queries.getGameRoles(gameId));
	const updateGameRoleAssignments = useUpdateGameRoleAssignments(gameId);

	if (gameResult.isLoading || gameRolesResult.isLoading) {
		return 'Loading';
	}
	if (!gameResult.isSuccess || !gameRolesResult.isSuccess) {
		return 'An error occurred loading the game.';
	}

	const gameDetails = gameResult.data;

	return (
		<NarrowContent>
			<RoleAssignment
				currentAssignments={gameDetails.permissions}
				playerNames={gameDetails.playerNames}
				roles={gameRolesResult.data}
				onSaveRoles={onSaveRoles}
			/>
		</NarrowContent>
	);
	function onSaveRoles(roleAssignments: { [userId: string]: string }) {
		const changed = Object.fromEntries(
			Object.entries(roleAssignments).filter(
				([key, newValue]) => newValue !== gameDetails.permissions[key],
			),
		);
		updateGameRoleAssignments.mutate(changed);
	}
}

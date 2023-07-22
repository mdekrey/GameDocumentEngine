import { queries } from '@/utils/api/queries';
import { NarrowContent } from '@/utils/containers/narrow-content';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RoleAssignment } from '@/components/forms/role-assignment/role-assignment';
import { UserRoleAssignmentValue } from '@/api/models/UserRoleAssignmentValue';

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
	const players = gameDetails.players as {
		[id: string]: UserRoleAssignmentValue;
	};

	return (
		<NarrowContent>
			<RoleAssignment
				currentAssignments={players}
				roles={gameRolesResult.data}
				onSaveRoles={onSaveRoles}
			/>
		</NarrowContent>
	);
	function onSaveRoles(roleAssignments: { [userId: string]: string }) {
		const changed = Object.fromEntries(
			Object.entries(roleAssignments).filter(
				([key, newValue]) => newValue !== players[key].role,
			),
		);
		updateGameRoleAssignments.mutate(changed);
	}
}

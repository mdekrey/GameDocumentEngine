import { queries } from '@/utils/api/queries';
import { useAreYouSure } from '@/utils/modal/layouts/are-you-sure-dialog';
import { useMutation } from '@tanstack/react-query';

function DeleteUserTarget({ playerName }: { playerName: string }) {
	return <span className="font-bold">{playerName}</span>;
}

export function useDeleteGameUser(gameId: string) {
	const removeUser = useMutation(queries.removePlayerFromGame);
	const areYouSure = useAreYouSure(['remove-game-user'], DeleteUserTarget);
	return async function showDeleteInviteModal(
		playerId: string,
		playerName: string,
	) {
		const result = await areYouSure({ playerName }).catch(() => false);
		if (result) {
			await removeUser.mutateAsync({ gameId, playerId });
		}
	};
}

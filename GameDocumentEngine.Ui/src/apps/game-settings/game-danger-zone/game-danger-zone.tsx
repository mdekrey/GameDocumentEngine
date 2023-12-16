import { useTranslation } from 'react-i18next';
import { HiOutlineTrash } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { queries } from '@/utils/api/queries';
import { Button } from '@/components/button/button';
import { useLaunchModal } from '@/utils/modal/modal-service';
import { DeleteGameModal } from './delete-game-modal';
import { IconButton } from '@/components/button/icon-button';
import { RemoveGameUserModal } from './remove-game-user-modal';
import type { GameDetails } from '@/api/models/GameDetails';
import { hasGamePermission } from '@/utils/security/match-permission';
import {
	deleteGame,
	updateGameUserAccess,
} from '@/utils/security/permission-strings';
import { useRealtimeApi } from '@/utils/api/realtime-api';

function displayRemoveUser(gameDetails: GameDetails) {
	return hasGamePermission(gameDetails, updateGameUserAccess);
}
function displayDeleteGame(gameDetails: GameDetails) {
	return hasGamePermission(gameDetails, deleteGame);
}

export function displayDangerZone(gameDetails: GameDetails) {
	return displayDeleteGame(gameDetails) || displayRemoveUser(gameDetails);
}

function useDeleteGame() {
	return useMutation(queries.deleteGame);
}

function useRemoveUserFromGame() {
	return useMutation(queries.removeUserFromGame);
}

export function GameDangerZone({ gameId }: { gameId: string }) {
	const navigate = useNavigate();
	const launchModal = useLaunchModal();
	const { t } = useTranslation('game-settings');
	const gameDetails = useSuspenseQuery(queries.getGameDetails(gameId)).data;
	const userDetails = useSuspenseQuery(
		queries.getCurrentUser(useRealtimeApi()),
	).data;
	const deleteGame = useDeleteGame();
	const removeUser = useRemoveUserFromGame();

	return (
		<>
			{displayRemoveUser(gameDetails) && (
				<ul className="list-disc ml-8">
					{Object.entries(gameDetails.playerNames)
						.filter(([id]) => id !== userDetails.id)
						.map(([id, name]) => (
							<li key={id} className="flex flex-row gap-3 my-3 items-center">
								{name}
								<IconButton.Destructive
									onClick={() => void onDeleteUser(id, name)}
									title={t('delete-user', { name })}
								>
									<HiOutlineTrash />
								</IconButton.Destructive>
							</li>
						))}
				</ul>
			)}
			{displayDeleteGame(gameDetails) && (
				<Button.Destructive onClick={() => void onDeleteGame()}>
					<HiOutlineTrash />
					{t('delete-game', { name: gameDetails.name })}
				</Button.Destructive>
			)}
		</>
	);

	async function onDeleteUser(userId: string, name: string) {
		const shouldDelete = await launchModal({
			ModalContents: RemoveGameUserModal,
			additional: { name },
		}).catch(() => false);
		if (shouldDelete) {
			removeUser.mutate({ gameId, userId });
		}
	}

	async function onDeleteGame() {
		const shouldDelete = await launchModal({
			ModalContents: DeleteGameModal,
			additional: { name: gameDetails.name },
		}).catch(() => false);
		if (shouldDelete) {
			deleteGame.mutate(gameId);
			navigate('..');
		}
	}
}

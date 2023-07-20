import { queries } from '@/utils/api/queries';
import { NarrowContent } from '@/utils/containers/narrow-content';
import { useModal } from '@/utils/modal/modal-service';
import { useMutation, useQuery } from '@tanstack/react-query';
import { HiOutlineUserAdd, HiOutlineCog, HiOutlineTrash } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { DeleteGameModal } from './delete-game-modal';
import { IconButton } from '@/components/button/icon-button';

function useDeleteGame() {
	return useMutation(queries.deleteGame);
}

export function GameDetails({ gameId }: { gameId: string }) {
	const gameResult = useQuery(queries.getGameDetails(gameId));
	const deleteGame = useDeleteGame();
	const navigate = useNavigate();
	const launchModal = useModal();

	if (gameResult.isLoading) {
		return 'Loading';
	}
	if (!gameResult.isSuccess) {
		return 'An error occurred loading the game.';
	}

	const gameDetails = gameResult.data;

	return (
		<NarrowContent>
			<div className="flex flex-row gap-3">
				<h1 className="text-2xl font-bold flex-1">{gameDetails.name}</h1>
				<IconButton onClick={() => navigate(`/game/${gameId}/invites`)}>
					<HiOutlineUserAdd />
				</IconButton>
				<IconButton onClick={() => navigate(`/game/${gameId}/edit`)}>
					<HiOutlineCog />
				</IconButton>
				<IconButton.Destructive onClick={() => void onDeleteGame()}>
					<HiOutlineTrash />
				</IconButton.Destructive>
			</div>
			{JSON.stringify(gameDetails.players)}
		</NarrowContent>
	);

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

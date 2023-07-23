import { queries } from '@/utils/api/queries';
import { NarrowContent } from '@/utils/containers/narrow-content';
import { useModal } from '@/utils/modal/modal-service';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	HiOutlineUserGroup,
	HiOutlineUserAdd,
	HiOutlineCog,
	HiOutlineTrash,
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { DeleteGameModal } from './delete-game-modal';
import { IconButton } from '@/components/button/icon-button';
import { RemoveGameUserModal } from './remove-game-user-modal';
import { IconLinkButton } from '@/components/button/icon-link-button';

function useDeleteGame() {
	return useMutation(queries.deleteGame);
}

function useRemoveUserFromGame() {
	return useMutation(queries.removeUserFromGame);
}

export function GameDetails({ gameId }: { gameId: string }) {
	const gameResult = useQuery(queries.getGameDetails(gameId));
	const deleteGame = useDeleteGame();
	const removeUser = useRemoveUserFromGame();
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
				<IconLinkButton to={`/game/${gameId}/invites`}>
					<HiOutlineUserAdd />
				</IconLinkButton>
				<IconLinkButton to={`/game/${gameId}/roles`}>
					<HiOutlineUserGroup />
				</IconLinkButton>
				<IconLinkButton to={`/game/${gameId}/edit`}>
					<HiOutlineCog />
				</IconLinkButton>
				<IconButton.Destructive onClick={() => void onDeleteGame()}>
					<HiOutlineTrash />
				</IconButton.Destructive>
			</div>
			<h2 className="text-lg font-bold">Users</h2>
			<ul className="list-disc ml-8">
				{Object.entries(gameDetails.playerNames).map(([id, name]) => (
					<li key={id} className="flex flex-row gap-3 my-3 items-center">
						{name}
						<IconButton.Destructive onClick={() => void onDeleteUser(id, name)}>
							<HiOutlineTrash />
						</IconButton.Destructive>
					</li>
				))}
			</ul>
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

	async function onDeleteUser(userId: string, name: string) {
		const shouldDelete = await launchModal({
			ModalContents: RemoveGameUserModal,
			additional: { name },
		}).catch(() => false);
		if (shouldDelete) {
			removeUser.mutate({ gameId, userId });
		}
	}
}

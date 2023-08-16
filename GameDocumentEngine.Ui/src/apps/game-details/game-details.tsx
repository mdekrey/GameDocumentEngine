import { queries } from '@/utils/api/queries';
import { useModal } from '@/utils/modal/modal-service';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	HiOutlineUserGroup,
	HiLink,
	HiOutlineCog,
	HiOutlineTrash,
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { DeleteGameModal } from './delete-game-modal';
import { IconButton } from '@/components/button/icon-button';
import { RemoveGameUserModal } from './remove-game-user-modal';
import { IconLinkButton } from '@/components/button/icon-link-button';
import { useTranslation } from 'react-i18next';

function useDeleteGame() {
	return useMutation(queries.deleteGame);
}

function useRemoveUserFromGame() {
	return useMutation(queries.removeUserFromGame);
}

export function GameDetails({ gameId }: { gameId: string }) {
	const { t } = useTranslation(['game-details']);
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
		<>
			<div className="flex flex-row gap-3">
				<h1 className="text-2xl font-bold flex-1">{gameDetails.name}</h1>
				<IconLinkButton to={`/game/${gameId}/invites`} title={t('add-user')}>
					<HiLink />
				</IconLinkButton>
				<IconLinkButton to={`/game/${gameId}/roles`} title={t('manage-users')}>
					<HiOutlineUserGroup />
				</IconLinkButton>
				<IconLinkButton to={`/game/${gameId}/edit`} title={t('edit-game')}>
					<HiOutlineCog />
				</IconLinkButton>
				<IconButton.Destructive
					title={t('delete-game')}
					onClick={() => void onDeleteGame()}
				>
					<HiOutlineTrash />
				</IconButton.Destructive>
			</div>
			<h2 className="text-lg font-bold">{t('heading-users')}</h2>
			<ul className="list-disc ml-8">
				{Object.entries(gameDetails.playerNames).map(([id, name]) => (
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
		</>
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

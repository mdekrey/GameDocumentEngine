import { Button } from '@/components/button/button';
import { ButtonRow } from '@/components/button/button-row';
import { queries } from '@/utils/api/queries';
import { NarrowContent } from '@/utils/containers/narrow-content';
import { ModalAlertLayout } from '@/utils/modal/alert-layout';
import { ModalContentsProps, useModal } from '@/utils/modal/modal-service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HiOutlineTrash } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

function useDeleteGame() {
	const queryClient = useQueryClient();
	return useMutation(queries.deleteGame(queryClient));
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
			<h1 className="text-2xl font-bold">{gameDetails.name}</h1>
			<ButtonRow>
				<Button.Destructive onClick={() => void onDeleteGame()}>
					<HiOutlineTrash className="inline-block mr-2" />
					Delete
				</Button.Destructive>
			</ButtonRow>
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

function DeleteGameModal({
	resolve,
	reject,
	additional: { name },
}: ModalContentsProps<boolean, { name: string }>) {
	return (
		<ModalAlertLayout>
			<ModalAlertLayout.Title>Delete game</ModalAlertLayout.Title>
			<p className="text-sm text-gray-500">
				Are you sure you want to delete the game called "{name}"? All of your
				game data will be permanently removed. This action cannot be undone.
			</p>
			<ModalAlertLayout.Buttons>
				<Button.Destructive onClick={() => resolve(true)}>
					Delete
				</Button.Destructive>
				<Button.Secondary onClick={() => reject('Cancel')}>
					Cancel
				</Button.Secondary>
			</ModalAlertLayout.Buttons>
		</ModalAlertLayout>
	);
}

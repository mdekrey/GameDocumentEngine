import { Button } from '@/components/button/button';
import { ButtonRow } from '@/components/button/button-row';
import { api, gameQuery, gamesQuery } from '@/utils/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HiOutlineTrash } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

function useDeleteGame() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const response = await api.deleteGame({ params: { gameId: id } });
			if (response.statusCode === 200) return response;
			else throw new Error('Could not save changes');
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries(gamesQuery.queryKey);
		},
	});
}

export function GameDetails({ gameId }: { gameId: string }) {
	const gameResult = useQuery(gameQuery(gameId));
	const deleteGame = useDeleteGame();
	const navigate = useNavigate();

	if (gameResult.isLoading) {
		return 'Loading';
	}
	if (!gameResult.isSuccess) {
		return 'An error occurred loading the game.';
	}

	return (
		<div className="max-w-screen-sm m-auto">
			<h1 className="text-2xl font-bold">{gameResult.data.name}</h1>
			<ButtonRow>
				<Button.Destructive
					onClick={() => {
						// TODO: confirmation dialog
						deleteGame.mutate(gameId);
						navigate('..');
					}}
				>
					<HiOutlineTrash className="inline-block mr-2" />
					Delete
				</Button.Destructive>
			</ButtonRow>
		</div>
	);
}

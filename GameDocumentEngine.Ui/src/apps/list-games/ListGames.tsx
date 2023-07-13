import { IconButton } from '@/components/button/icon-button';
import { destructive, save } from '@/components/button/themes';
import { api, gamesQuery } from '@/utils/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useReducer } from 'react';
import { HiArrowRight, HiOutlineTrash, HiX } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';

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

export function ListGames() {
	const [showDelete, toggleShowDelete] = useReducer((v) => !v, false);
	const gamesResult = useQuery(gamesQuery);
	const deleteGame = useDeleteGame();
	const navigate = useNavigate();

	if (gamesResult.isLoading) {
		return 'Loading';
	}
	if (!gamesResult.isSuccess) {
		return 'An error occurred loading the list of games.';
	}

	return (
		<div className="max-w-screen-sm m-auto flex flex-col">
			<span className="flex flex-row items-center gap-4 mb-4">
				<h1 className="flex-1">All Games</h1>
				<IconButton
					className={!showDelete ? destructive : save}
					onClick={toggleShowDelete}
				>
					{!showDelete ? <HiOutlineTrash /> : <HiX />}
				</IconButton>
			</span>
			<ul className="contents">
				{gamesResult.data.map((game) => (
					<li key={game.id} className="flex flex-row items-center gap-4">
						<Link to={`/game/${game.id}`}>{game.name}</Link>
						<hr className="flex-1" />
						<div className="my-2 flex flex-row gap-2">
							<IconButton onClick={() => navigate(`/game/${game.id}`)}>
								<HiArrowRight />
							</IconButton>
							{showDelete && (
								<IconButton
									className={destructive}
									onClick={() => {
										// TODO: confirmation dialog
										deleteGame.mutate(game.id);
										toggleShowDelete();
									}}
								>
									<HiOutlineTrash />
								</IconButton>
							)}
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}

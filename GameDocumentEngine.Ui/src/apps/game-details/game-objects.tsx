import { IconButton } from '@/components/button/icon-button';
import { queries } from '@/utils/api/queries';
import { useRealtimeApi } from '@/utils/api/realtime';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { HiPlus } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import { useGameType } from '../documents/useGameType';

function useGameEvents(gameId: string) {
	const realtimeApi = useRealtimeApi();

	useEffect(() => {
		const activate = realtimeApi.subscribeToGame(gameId);
		return () => {
			activate
				.then(async () => {
					await realtimeApi.unsubscribeFromGame(gameId);
				})
				.catch((err) => console.error(err));
		};
	}, [realtimeApi, gameId]);
}

export function GameObjects({ gameId }: { gameId: string }) {
	const navigate = useNavigate();
	const docsResult = useQuery(queries.listDocuments(gameId));
	// TODO: do something with game deatils
	const gameDetails = useQuery(queries.getGameDetails(gameId));
	const gameType = useGameType(gameId);

	useGameEvents(gameId);

	if (gameDetails.isLoading || docsResult.isLoading || gameType.isLoading) {
		return <>Loading</>;
	} else if (gameDetails.isError || docsResult.isError || gameType.isError) {
		return <>Error</>;
	}

	return (
		<>
			<div className="flex flex-row gap-3">
				<span className="flex-1 text-lg font-bold">
					{gameDetails.data.name}
				</span>
				<IconButton.Save
					onClick={() => navigate(`/game/${gameId}/create-document`)}
				>
					<HiPlus />
				</IconButton.Save>
			</div>
			<ul>
				{docsResult.data.map((s) => {
					const Icon = gameType.data.objectTypes[s.type].typeInfo.icon;
					return (
						<li key={s.id}>
							<Link
								to={`/game/${gameId}/document/${s.id}`}
								className="flex flex-row items-center gap-2"
							>
								<Icon className="h-5 w-5" /> {s.name}
							</Link>
						</li>
					);
				})}
			</ul>
		</>
	);
}

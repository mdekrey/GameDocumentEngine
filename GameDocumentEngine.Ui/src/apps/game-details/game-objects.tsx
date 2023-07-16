import { IconButton } from '@/components/button/icon-button';
import { queries } from '@/utils/api/queries';
import { useQuery } from '@tanstack/react-query';
import { HiPlus } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';

export function GameObjects({ gameId }: { gameId: string }) {
	const navigate = useNavigate();
	const docsResult = useQuery(queries.listDocuments(gameId));
	// TODO: do something with game deatils
	useQuery(queries.getGameDetails(gameId));

	if (docsResult.isLoading) {
		return <>Loading</>;
	} else if (docsResult.isError) {
		return <>Error</>;
	}

	return (
		<>
			<IconButton.Save
				onClick={() => navigate(`/game/${gameId}/create-document`)}
			>
				<HiPlus />
			</IconButton.Save>
			<ul>
				{docsResult.data.map((s) => (
					<li key={s.id}>
						<Link to={`/game/${gameId}/document/${s.id}`}>
							{s.type} - {s.name}
						</Link>
					</li>
				))}
			</ul>
		</>
	);
}
